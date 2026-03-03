"""
Permissoes Module Tests
Testes dos endpoints de Permissoes (CRUD)
"""

import requests
import json
from typing import Dict, Optional, List
from config import BASE_URL, TEST_ADMIN


class TestPermissoes:
    """Testes dos endpoints de Permissoes"""
    
    MODULOS_VALIDOS = ['tema', 'pagina', 'componente', 'elemento', 'usuario', 'parceiro', 'relatorios', 'auditoria']
    ACOES_VALIDAS = ['criar', 'listar', 'editar', 'deletar', 'visualizar', 'exportar', 'estatisticas', 'filtrar']
    
    def __init__(self):
        self.token: Optional[str] = None
        self.permissao_id: Optional[str] = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
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
    
    def test_list_permissoes(self) -> bool:
        """
        GET /permissoes
        Testa listagem de todas as permissões com paginação
        """
        try:
            response = requests.get(
                f"{BASE_URL}/permissoes?page=1&limit=50",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'pagination' in data, "pagination não presente"
                
                permissoes_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                self._print_test(
                    "GET /permissoes (Listar)",
                    "PASS",
                    f"Total de permissões na página: {permissoes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /permissoes (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /permissoes (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_permissao_by_id(self) -> bool:
        """
        GET /permissoes/:id
        Testa obtenção de uma permissão específica
        """
        try:
            # Primeiro lista para pegar um ID válido
            list_response = requests.get(
                f"{BASE_URL}/permissoes?page=1&limit=1",
                headers=self._get_headers(),
                timeout=5
            )
            
            if list_response.status_code != 200:
                self._print_test(
                    "GET /permissoes/:id (Obter)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            permissoes = list_response.json().get('data', [])
            if not permissoes:
                self._print_test(
                    "GET /permissoes/:id (Obter)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            perm_id = permissoes[0]['perm_id']
            
            response = requests.get(
                f"{BASE_URL}/permissoes/{perm_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data']['perm_id'] == perm_id, "ID não corresponde"
                
                perm_nome = data['data'].get('perm_nome', 'N/A')
                
                self._print_test(
                    "GET /permissoes/:id (Obter)",
                    "PASS",
                    f"Permissão: {perm_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /permissoes/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /permissoes/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_permissao(self) -> bool:
        """
        POST /permissoes
        Testa criação de uma nova permissão
        """
        try:
            import time
            timestamp = int(time.time() * 1000) % 10000
            new_permissao = {
                "perm_nome": f"tema_custom_{timestamp}",
                "perm_modulo": "tema",
                "perm_acao": "criar",
                "perm_descricao": "Permissão de teste para criação de tema"
            }
            
            response = requests.post(
                f"{BASE_URL}/permissoes",
                headers=self._get_headers(),
                json=new_permissao,
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'perm_id' in data['data'], "perm_id não presente"
                assert data['data']['perm_nome'] == new_permissao['perm_nome'], "Nome não corresponde"
                
                self.permissao_id = data['data']['perm_id']
                
                self._print_test(
                    "POST /permissoes (Criar)",
                    "PASS",
                    f"Permissão criada: {self.permissao_id}"
                )
                return True
            else:
                self._print_test(
                    "POST /permissoes (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /permissoes (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_permissao(self) -> bool:
        """
        PUT /permissoes/:id
        Testa atualização de uma permissão
        """
        try:
            # Se não tem ID de teste, pega a primeira permissão
            perm_id = self.permissao_id
            if not perm_id:
                list_response = requests.get(
                    f"{BASE_URL}/permissoes?page=1&limit=1",
                    headers=self._get_headers(),
                    timeout=5
                )
                if list_response.status_code == 200:
                    permissoes = list_response.json().get('data', [])
                    if permissoes:
                        perm_id = permissoes[0]['perm_id']
            
            if not perm_id:
                self._print_test(
                    "PUT /permissoes/:id (Atualizar)",
                    "SKIP",
                    "Nenhuma permissão disponível para teste"
                )
                return True
            
            update_data = {
                "perm_descricao": "Descrição atualizada para teste"
            }
            
            response = requests.put(
                f"{BASE_URL}/permissoes/{perm_id}",
                headers=self._get_headers(),
                json=update_data,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data']['perm_descricao'] == update_data['perm_descricao'], "Descrição não foi atualizada"
                
                self._print_test(
                    "PUT /permissoes/:id (Atualizar)",
                    "PASS",
                    f"Permissão atualizada: {perm_id}"
                )
                return True
            else:
                self._print_test(
                    "PUT /permissoes/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /permissoes/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_permissoes_by_modulo(self) -> bool:
        """
        GET /permissoes/modulo/:modulo
        Testa listagem de permissões por módulo
        """
        try:
            modulo = 'tema'
            response = requests.get(
                f"{BASE_URL}/permissoes/modulo/{modulo}?page=1&limit=50",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                permissoes_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                # Validar que todas são do módulo 'tema'
                for permissao in data['data']:
                    assert permissao['perm_modulo'] == modulo, f"Permissão {permissao['perm_id']} não é do módulo {modulo}"
                
                self._print_test(
                    "GET /permissoes/modulo/:modulo (Filtrar por Módulo)",
                    "PASS",
                    f"Permissões do módulo '{modulo}': {permissoes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /permissoes/modulo/:modulo (Filtrar por Módulo)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /permissoes/modulo/:modulo (Filtrar por Módulo)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_permissoes_by_acao(self) -> bool:
        """
        GET /permissoes/acao/:acao
        Testa listagem de permissões por ação
        """
        try:
            acao = 'editar'
            response = requests.get(
                f"{BASE_URL}/permissoes/acao/{acao}?page=1&limit=50",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                permissoes_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                # Validar que todas são da ação 'editar'
                for permissao in data['data']:
                    assert permissao['perm_acao'] == acao, f"Permissão {permissao['perm_id']} não é da ação {acao}"
                
                self._print_test(
                    "GET /permissoes/acao/:acao (Filtrar por Ação)",
                    "PASS",
                    f"Permissões de '{acao}': {permissoes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /permissoes/acao/:acao (Filtrar por Ação)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /permissoes/acao/:acao (Filtrar por Ação)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_permissao(self) -> bool:
        """
        DELETE /permissoes/:id
        Testa deleção de uma permissão
        """
        try:
            # Cria uma permissão para deletar
            import time
            timestamp = int(time.time() * 1000) % 10000
            new_permissao = {
                "perm_nome": f"delete_test_{timestamp}",
                "perm_modulo": "tema",
                "perm_acao": "deletar",
                "perm_descricao": "Permissão para deletar teste"
            }
            
            create_response = requests.post(
                f"{BASE_URL}/permissoes",
                headers=self._get_headers(),
                json=new_permissao,
                timeout=5
            )
            
            if create_response.status_code != 201:
                self._print_test(
                    "DELETE /permissoes/:id (Deletar)",
                    "SKIP",
                    "Não foi possível criar permissão para teste"
                )
                return True
            
            perm_id = create_response.json()['data']['perm_id']
            
            # Agora deleta
            response = requests.delete(
                f"{BASE_URL}/permissoes/{perm_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data.get('message'), "message não presente"
                
                self._print_test(
                    "DELETE /permissoes/:id (Deletar)",
                    "PASS",
                    f"Permissão deletada: {perm_id}"
                )
                return True
            else:
                self._print_test(
                    "DELETE /permissoes/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /permissoes/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None) -> Dict:
        """Executa todos os testes de permissões"""
        print("\n" + "="*60)
        print("PERMISSOES - Test Suite")
        print("="*60)
        
        # Autenticar
        if not self._authenticate(shared_token):
            print("❌ Erro ao autenticar para testes de permissões")
            return self.results
        
        # Executar testes
        self.test_list_permissoes()
        self.test_get_permissao_by_id()
        self.test_create_permissao()
        self.test_update_permissao()
        self.test_get_permissoes_by_modulo()
        self.test_get_permissoes_by_acao()
        self.test_delete_permissao()
        
        # Resumo
        print(f"\n{'─'*60}")
        print(f"Permissoes: {self.results['passed']} passed, {self.results['failed']} failed")
        
        if self.results['errors']:
            print("\nErros:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        return self.results
