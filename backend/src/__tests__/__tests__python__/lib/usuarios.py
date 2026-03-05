"""
Usuarios Module Tests
Testes dos endpoints de Usuarios (CRUD)
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN


class TestUsuarios:
    """Testes dos endpoints de Usuarios"""
    
    def __init__(self):
        self.token: Optional[str] = None
        self.usuario_id: Optional[str] = None
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
    
    def test_list_usuarios(self) -> bool:
        """
        GET /usuarios
        Testa listagem de todos os usuários com paginação
        """
        try:
            response = requests.get(
                f"{BASE_URL}/usuarios?page=1&limit=10",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'pagination' in data, "pagination não presente"
                
                usuarios_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                self._print_test(
                    "GET /usuarios (Listar)",
                    "PASS",
                    f"Total de usuários na página: {usuarios_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /usuarios (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /usuarios (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_usuario_by_id(self) -> bool:
        """
        GET /usuarios/:id
        Testa obtenção de um usuário específico
        """
        try:
            # Primeiro lista para pegar um ID válido
            list_response = requests.get(
                f"{BASE_URL}/usuarios?page=1&limit=1",
                headers=self._get_headers(),
                timeout=5
            )
            
            if list_response.status_code != 200:
                self._print_test(
                    "GET /usuarios/:id (Obter)",
                    "SKIP",
                    "Nenhum usuário disponível para teste"
                )
                return True
            
            usuarios = list_response.json().get('data', [])
            if not usuarios:
                self._print_test(
                    "GET /usuarios/:id (Obter)",
                    "SKIP",
                    "Nenhum usuário disponível para teste"
                )
                return True
            
            usuario_id = usuarios[0]['usu_id']
            
            response = requests.get(
                f"{BASE_URL}/usuarios/{usuario_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data']['usu_id'] == usuario_id, "ID não corresponde"
                assert 'usu_senha' not in data['data'], "Senha não deve ser retornada"
                
                usuario_nome = data['data'].get('usu_nome', 'N/A')
                
                self._print_test(
                    "GET /usuarios/:id (Obter)",
                    "PASS",
                    f"Usuário: {usuario_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /usuarios/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /usuarios/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_usuario(self) -> bool:
        """
        POST /usuarios
        Testa criação de um novo usuário
        """
        try:
            import time
            timestamp = int(time.time() * 1000) % 10000
            new_usuario = {
                "usu_email": f"teste_{timestamp}@siteoni.com.br",
                "usu_nome": "Usuário Teste",
                "usu_senha": "senha123456",
                "usu_tipo": "usuario",
                "usu_telefone": "(11) 99999-9999"
            }
            
            response = requests.post(
                f"{BASE_URL}/usuarios",
                headers=self._get_headers(),
                json=new_usuario,
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'usu_id' in data['data'], "usu_id não presente"
                assert 'usu_senha' not in data['data'], "Senha não deve ser retornada"
                assert data['data']['usu_email'] == new_usuario['usu_email'], "Email não corresponde"
                
                self.usuario_id = data['data']['usu_id']
                
                self._print_test(
                    "POST /usuarios (Criar)",
                    "PASS",
                    f"Usuário criado: {self.usuario_id}"
                )
                return True
            else:
                self._print_test(
                    "POST /usuarios (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /usuarios (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_usuario(self) -> bool:
        """
        PUT /usuarios/:id
        Testa atualização de um usuário
        """
        try:
            # Se não tem ID de teste, pega o primeiro usuário
            usuario_id = self.usuario_id
            if not usuario_id:
                list_response = requests.get(
                    f"{BASE_URL}/usuarios?page=1&limit=1",
                    headers=self._get_headers(),
                    timeout=5
                )
                if list_response.status_code == 200:
                    usuarios = list_response.json().get('data', [])
                    if usuarios:
                        usuario_id = usuarios[0]['usu_id']
            
            if not usuario_id:
                self._print_test(
                    "PUT /usuarios/:id (Atualizar)",
                    "SKIP",
                    "Nenhum usuário disponível para teste"
                )
                return True
            
            update_data = {
                "usu_nome": "Usuário Atualizado",
                "usu_telefone": "(11) 98888-8888"
            }
            
            response = requests.put(
                f"{BASE_URL}/usuarios/{usuario_id}",
                headers=self._get_headers(),
                json=update_data,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data']['usu_nome'] == update_data['usu_nome'], "Nome não foi atualizado"
                
                self._print_test(
                    "PUT /usuarios/:id (Atualizar)",
                    "PASS",
                    f"Usuário atualizado: {usuario_id}"
                )
                return True
            else:
                self._print_test(
                    "PUT /usuarios/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /usuarios/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_usuario_status(self) -> bool:
        """
        PUT /usuarios/:id/status
        Testa atualização de status de um usuário
        """
        try:
            # Se não tem ID de teste, pega o primeiro usuário
            usuario_id = self.usuario_id
            if not usuario_id:
                list_response = requests.get(
                    f"{BASE_URL}/usuarios?page=1&limit=1",
                    headers=self._get_headers(),
                    timeout=5
                )
                if list_response.status_code == 200:
                    usuarios = list_response.json().get('data', [])
                    if usuarios:
                        usuario_id = usuarios[0]['usu_id']
            
            if not usuario_id:
                self._print_test(
                    "PUT /usuarios/:id/status (Atualizar Status)",
                    "SKIP",
                    "Nenhum usuário disponível para teste"
                )
                return True
            
            status_data = {
                "usu_status": "inativo"
            }
            
            response = requests.put(
                f"{BASE_URL}/usuarios/{usuario_id}/status",
                headers=self._get_headers(),
                json=status_data,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data']['usu_status'] == 'inativo', "Status não foi atualizado"
                
                self._print_test(
                    "PUT /usuarios/:id/status (Atualizar Status)",
                    "PASS",
                    f"Status atualizado para: inativo"
                )
                return True
            else:
                self._print_test(
                    "PUT /usuarios/:id/status (Atualizar Status)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /usuarios/:id/status (Atualizar Status)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_usuarios_by_type(self) -> bool:
        """
        GET /usuarios/tipo/:tipo
        Testa listagem de usuários por tipo
        """
        try:
            response = requests.get(
                f"{BASE_URL}/usuarios/tipo/admin?page=1&limit=10",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                usuarios_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                # Validar que todos são do tipo admin
                for usuario in data['data']:
                    assert usuario['usu_tipo'] == 'admin', f"Usuário {usuario['usu_id']} não é do tipo admin"
                
                self._print_test(
                    "GET /usuarios/tipo/:tipo (Filtrar por Tipo)",
                    "PASS",
                    f"Usuários admin encontrados: {usuarios_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /usuarios/tipo/:tipo (Filtrar por Tipo)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /usuarios/tipo/:tipo (Filtrar por Tipo)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_usuario(self) -> bool:
        """
        DELETE /usuarios/:id
        Testa deleção de um usuário
        """
        try:
            # Cria um usuário para deletar
            import time
            timestamp = int(time.time() * 1000) % 10000
            new_usuario = {
                "usu_email": f"delete_test_{timestamp}@siteoni.com.br",
                "usu_nome": "Usuário para Deletar",
                "usu_senha": "senha123456",
                "usu_tipo": "usuario"
            }
            
            create_response = requests.post(
                f"{BASE_URL}/usuarios",
                headers=self._get_headers(),
                json=new_usuario,
                timeout=5
            )
            
            if create_response.status_code != 201:
                self._print_test(
                    "DELETE /usuarios/:id (Deletar)",
                    "SKIP",
                    "Não foi possível criar usuário para teste"
                )
                return True
            
            usuario_id = create_response.json()['data']['usu_id']
            
            # Agora deleta
            response = requests.delete(
                f"{BASE_URL}/usuarios/{usuario_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data.get('message'), "message não presente"
                
                self._print_test(
                    "DELETE /usuarios/:id (Deletar)",
                    "PASS",
                    f"Usuário deletado: {usuario_id}"
                )
                return True
            else:
                self._print_test(
                    "DELETE /usuarios/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /usuarios/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None) -> Dict:
        """Executa todos os testes de usuários"""
        print("\n" + "="*60)
        print("USUARIOS - Test Suite")
        print("="*60)
        
        # Autenticar
        if not self._authenticate(shared_token):
            print("❌ Erro ao autenticar para testes de usuários")
            return self.results
        
        # Executar testes
        self.test_list_usuarios()
        self.test_get_usuario_by_id()
        self.test_create_usuario()
        self.test_update_usuario()
        self.test_update_usuario_status()
        self.test_get_usuarios_by_type()
        self.test_delete_usuario()
        
        # Resumo
        print(f"\n{'─'*60}")
        print(f"Usuarios: {self.results['passed']} passed, {self.results['failed']} failed")
        
        if self.results['errors']:
            print("\nErros:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        return self.results
