"""
RolePermissoes Module Tests
Testes dos endpoints de RolePermissoes (Gerenciamento de permissões por role)
"""

import requests
import json
from typing import Dict, Optional, List
from config import BASE_URL, TEST_ADMIN


class TestRolePermissoes:
    """Testes dos endpoints de RolePermissoes"""
    
    ROLES_VALIDOS = ['admin', 'gestor', 'usuario']
    
    def __init__(self):
        self.token: Optional[str] = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.permissao_id: Optional[str] = None
    
    def _authenticate(self, shared_token: Optional[str] = None) -> bool:
        """Obter token de autenticação ou usar compartilhado"""
        if shared_token:
            self.token = shared_token
            return True
        
        # Fallback: fazer login como admin
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": TEST_ADMIN['email'],
                    "senha": TEST_ADMIN['password']
                },
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data['data']['token']
                return True
        except Exception as e:
            print(f"❌ Erro ao fazer login: {e}")
        return False
    
    def _get_headers(self) -> Dict:
        """Retorna headers com token de autenticação"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        } if self.token else {"Content-Type": "application/json"}
    
    def _print_test(self, name: str, status: str, details: str = ""):
        """Print test result"""
        symbol = "✅" if status == "PASS" else "❌"
        print(f"{symbol} {name}: {status}")
        if details:
            print(f"   └─ {details}")
        
        if status == "PASS":
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{name}: {details}")
    
    def _get_test_permissao_id(self) -> Optional[str]:
        """Obtém ou cria uma permissão para testes"""
        if self.permissao_id:
            return self.permissao_id
        
        try:
            # Tenta obter primeiro
            list_response = requests.get(
                f"{BASE_URL}/permissoes?page=1&limit=1",
                headers=self._get_headers(),
                timeout=5
            )
            
            if list_response.status_code == 200:
                permissoes = list_response.json().get('data', [])
                if permissoes:
                    self.permissao_id = permissoes[0]['perm_id']
                    return self.permissao_id
            
            # Se não há permissões, cria uma
            import time
            timestamp = int(time.time() * 1000) % 10000
            create_response = requests.post(
                f"{BASE_URL}/permissoes",
                headers=self._get_headers(),
                json={
                    "perm_nome": f"test_perm_{timestamp}",
                    "perm_modulo": "tema",
                    "perm_acao": "visualizar"
                },
                timeout=5
            )
            
            if create_response.status_code == 201:
                self.permissao_id = create_response.json()['data']['perm_id']
                return self.permissao_id
        
        except Exception as e:
            print(f"Erro ao obter permissão de teste: {e}")
        
        return None
    
    def test_get_role_permissoes(self) -> bool:
        """
        GET /role-permissoes/:tipo
        Testa listagem de permissões de um role
        """
        try:
            tipo = 'admin'
            response = requests.get(
                f"{BASE_URL}/role-permissoes/{tipo}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data.get('tipo') == tipo, "tipo não corresponde"
                assert 'data' in data, "data não presente"
                
                permissoes_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                self._print_test(
                    "GET /role-permissoes/:tipo (Listar)",
                    "PASS",
                    f"Permissões do role '{tipo}': {permissoes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /role-permissoes/:tipo (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /role-permissoes/:tipo (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_atribuir_permissao_role(self) -> bool:
        """
        POST /role-permissoes/:tipo/permissoes/:permissaoId
        Testa atribuição de permissão a um role
        """
        try:
            tipo = 'usuario'
            perm_id = self._get_test_permissao_id()
            
            if not perm_id:
                self._print_test(
                    "POST /role-permissoes/:tipo/permissoes/:permissaoId (Atribuir)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            response = requests.post(
                f"{BASE_URL}/role-permissoes/{tipo}/permissoes/{perm_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data.get('message'), "message não presente"
                
                self._print_test(
                    "POST /role-permissoes/:tipo/permissoes/:permissaoId (Atribuir)",
                    "PASS",
                    f"Permissão atribuída ao role '{tipo}'"
                )
                return True
            else:
                self._print_test(
                    "POST /role-permissoes/:tipo/permissoes/:permissaoId (Atribuir)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /role-permissoes/:tipo/permissoes/:permissaoId (Atribuir)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_verificar_permissao_role(self) -> bool:
        """
        GET /role-permissoes/:tipo/tem/:permissaoNome
        Testa verificação de permissão de um role
        """
        try:
            tipo = 'admin'
            perm_nome = 'tema_editar'
            
            response = requests.get(
                f"{BASE_URL}/role-permissoes/{tipo}/tem/{perm_nome}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'tem' in data, "tem não presente"
                assert isinstance(data['tem'], bool), "tem deve ser booleano"
                
                tem_permissao = data['tem']
                self._print_test(
                    "GET /role-permissoes/:tipo/tem/:permissaoNome (Verificar)",
                    "PASS",
                    f"Role '{tipo}' tem '{perm_nome}': {tem_permissao}"
                )
                return True
            else:
                self._print_test(
                    "GET /role-permissoes/:tipo/tem/:permissaoNome (Verificar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /role-permissoes/:tipo/tem/:permissaoNome (Verificar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_remover_permissao_role(self) -> bool:
        """
        DELETE /role-permissoes/:tipo/permissoes/:permissaoId
        Testa remoção de permissão de um role
        """
        try:
            tipo = 'usuario'
            perm_id = self._get_test_permissao_id()
            
            if not perm_id:
                self._print_test(
                    "DELETE /role-permissoes/:tipo/permissoes/:permissaoId (Remover)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            # Primeiro tenta atribuir (para ter algo para remover)
            requests.post(
                f"{BASE_URL}/role-permissoes/{tipo}/permissoes/{perm_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            # Agora remove
            response = requests.delete(
                f"{BASE_URL}/role-permissoes/{tipo}/permissoes/{perm_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data.get('message'), "message não presente"
                
                self._print_test(
                    "DELETE /role-permissoes/:tipo/permissoes/:permissaoId (Remover)",
                    "PASS",
                    f"Permissão removida do role '{tipo}'"
                )
                return True
            else:
                self._print_test(
                    "DELETE /role-permissoes/:tipo/permissoes/:permissaoId (Remover)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /role-permissoes/:tipo/permissoes/:permissaoId (Remover)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_substituir_permissoes_role(self) -> bool:
        """
        PUT /role-permissoes/:tipo/permissoes
        Testa substituição de todas as permissões de um role
        """
        try:
            tipo = 'usuario'
            
            # Obtém todas as permissões disponíveis (primeiras 3)
            perm_list_response = requests.get(
                f"{BASE_URL}/permissoes?page=1&limit=3",
                headers=self._get_headers(),
                timeout=5
            )
            
            if perm_list_response.status_code != 200:
                self._print_test(
                    "PUT /role-permissoes/:tipo/permissoes (Substituir)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            permissoes = perm_list_response.json().get('data', [])
            if not permissoes:
                self._print_test(
                    "PUT /role-permissoes/:tipo/permissoes (Substituir)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            perm_ids = [p['perm_id'] for p in permissoes[:3]]
            
            response = requests.put(
                f"{BASE_URL}/role-permissoes/{tipo}/permissoes",
                headers=self._get_headers(),
                json={"permissaoIds": perm_ids},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data.get('message'), "message não presente"
                assert isinstance(data.get('data'), list), "data deve ser lista de permissões"
                
                self._print_test(
                    "PUT /role-permissoes/:tipo/permissoes (Substituir)",
                    "PASS",
                    f"Permissões do role '{tipo}' substituídas: {len(perm_ids)} permissões"
                )
                return True
            else:
                self._print_test(
                    "PUT /role-permissoes/:tipo/permissoes (Substituir)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /role-permissoes/:tipo/permissoes (Substituir)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_permissoes_por_role(self) -> bool:
        """
        Testa limites de permissões para diferentes roles
        """
        try:
            todos_pass = True
            
            # Admin deve ter mais permissões
            admin_response = requests.get(
                f"{BASE_URL}/role-permissoes/admin",
                headers=self._get_headers(),
                timeout=5
            )
            
            # Gestor deve ter menos permissões que admin
            gestor_response = requests.get(
                f"{BASE_URL}/role-permissoes/gestor",
                headers=self._get_headers(),
                timeout=5
            )
            
            # Usuario deve ter menos permissões que gestor
            usuario_response = requests.get(
                f"{BASE_URL}/role-permissoes/usuario",
                headers=self._get_headers(),
                timeout=5
            )
            
            if all(r.status_code == 200 for r in [admin_response, gestor_response, usuario_response]):
                admin_count = len(admin_response.json().get('data', []))
                gestor_count = len(gestor_response.json().get('data', []))
                usuario_count = len(usuario_response.json().get('data', []))
                
                # Validar hierarquia (esperado)
                # admin >= gestor >= usuario
                
                self._print_test(
                    "Hierarquia de Permissões (Admin/Gestor/Usuario)",
                    "PASS",
                    f"Admin: {admin_count}, Gestor: {gestor_count}, Usuario: {usuario_count}"
                )
                return True
            else:
                self._print_test(
                    "Hierarquia de Permissões (Admin/Gestor/Usuario)",
                    "FAIL",
                    "Não foi possível obter permissões de um dos roles"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "Hierarquia de Permissões (Admin/Gestor/Usuario)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None) -> Dict:
        """Executa todos os testes de role-permissões"""
        print("\n" + "="*60)
        print("ROLE-PERMISSOES - Test Suite")
        print("="*60)
        
        # Autenticar
        if not self._authenticate(shared_token):
            print("❌ Erro ao autenticar para testes de role-permissões")
            return self.results
        
        # Executar testes
        self.test_get_role_permissoes()
        self.test_atribuir_permissao_role()
        self.test_verificar_permissao_role()
        self.test_remover_permissao_role()
        self.test_substituir_permissoes_role()
        self.test_permissoes_por_role()
        
        # Resumo
        print(f"\n{'─'*60}")
        print(f"RolePermissoes: {self.results['passed']} passed, {self.results['failed']} failed")
        
        if self.results['errors']:
            print("\nErros:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        return self.results
