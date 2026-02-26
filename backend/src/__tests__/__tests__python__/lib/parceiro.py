"""
Parceiro Module Tests
Testes dos endpoints de Parceiro (CRUD)
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN, TEST_PARCEIRO_ID


class TestParceiro:
    """Testes dos endpoints de Parceiro"""
    
    def __init__(self):
        self.token: Optional[str] = None
        self.parceiro_id: Optional[str] = None
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
    
    def test_list_parceiros(self) -> bool:
        """
        GET /parceiros
        Testa listagem de todos os parceiros
        """
        try:
            response = requests.get(
                f"{BASE_URL}/parceiros",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                parceiros_count = len(data['data']) if isinstance(data['data'], list) else 0
                
                self._print_test(
                    "GET /parceiros (Listar)",
                    "PASS",
                    f"Total de parceiros: {parceiros_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /parceiros (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /parceiros (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_parceiro_by_id(self) -> bool:
        """
        GET /parceiros/:id
        Testa obtenção de um parceiro específico
        """
        try:
            response = requests.get(
                f"{BASE_URL}/parceiros/{TEST_PARCEIRO_ID}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data']['par_id'] == TEST_PARCEIRO_ID, "ID não corresponde"
                
                parceiro_nome = data['data'].get('par_nome', 'N/A')
                
                self._print_test(
                    "GET /parceiros/:id (Obter)",
                    "PASS",
                    f"Parceiro: {parceiro_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /parceiros/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /parceiros/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_parceiro(self) -> bool:
        """
        POST /parceiros
        Testa criação de novo parceiro
        """
        try:
            parceiro_data = {
                "par_nome": "Test Parceiro",
                "par_dominio": "http://test.local",
                "par_cidade": "Teste City",
                "par_endereco": "Rua Teste, 123",
                "par_cep": "12345-678",
                "par_latitude": -27.1234,
                "par_longitude": -48.5678,
                "par_raio_cobertura": 50
            }
            
            response = requests.post(
                f"{BASE_URL}/parceiros",
                json=parceiro_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('par_nome') == "Test Parceiro", "Nome não corresponde"
                
                # Armazenar o ID para testes posteriores
                self.parceiro_id = data['data']['par_id']
                
                self._print_test(
                    "POST /parceiros (Criar)",
                    "PASS",
                    f"Parceiro criado com ID: {self.parceiro_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /parceiros (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /parceiros (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_parceiro(self) -> bool:
        """
        PUT /parceiros/:id
        Testa atualização de parceiro
        """
        if not self.parceiro_id:
            self._print_test(
                "PUT /parceiros/:id (Atualizar)",
                "FAIL",
                "Nenhum parceiro criado para atualizar"
            )
            return False
        
        try:
            update_data = {
                "par_nome": "Test Parceiro Atualizado"
            }
            
            response = requests.put(
                f"{BASE_URL}/parceiros/{self.parceiro_id}",
                json=update_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data['data'].get('par_nome') == "Test Parceiro Atualizado", "Nome não foi atualizado"
                
                self._print_test(
                    "PUT /parceiros/:id (Atualizar)",
                    "PASS",
                    "Parceiro atualizado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /parceiros/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /parceiros/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_parceiro(self) -> bool:
        """
        DELETE /parceiros/:id
        Testa exclusão de parceiro
        """
        if not self.parceiro_id:
            self._print_test(
                "DELETE /parceiros/:id (Deletar)",
                "FAIL",
                "Nenhum parceiro criado para deletar"
            )
            return False
        
        try:
            response = requests.delete(
                f"{BASE_URL}/parceiros/{self.parceiro_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200 or response.status_code == 204:
                self._print_test(
                    "DELETE /parceiros/:id (Deletar)",
                    "PASS",
                    "Parceiro deletado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /parceiros/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /parceiros/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_parceiro_not_found(self) -> bool:
        """
        GET /parceiros/:id
        Testa obtenção de parceiro inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            
            response = requests.get(
                f"{BASE_URL}/parceiros/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                data = response.json()
                
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "GET /parceiros/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para parceiro inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /parceiros/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /parceiros/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_nearby_parceiros(self) -> bool:
        """
        GET /parceiros/nearby/:latitude/:longitude
        Testa busca de parceiros próximos por coordenadas
        """
        try:
            # Coordenadas de São Paulo como exemplo
            latitude = -23.5505
            longitude = -46.6333
            
            response = requests.get(
                f"{BASE_URL}/parceiros/nearby/{latitude}/{longitude}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert isinstance(data['data'], list), "data deve ser array"
                
                self._print_test(
                    "GET /parceiros/nearby/:latitude/:longitude (Próximos)",
                    "PASS",
                    f"Encontrados {len(data['data'])} parceiros próximos"
                )
                return True
            else:
                self._print_test(
                    "GET /parceiros/nearby/:latitude/:longitude (Próximos)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /parceiros/nearby/:latitude/:longitude (Próximos)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        """Executar todos os testes"""
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        
        print("\n" + "="*60)
        print("🏢 TESTES DE PARCEIRO (PARCEIRO)")
        print("="*60 + "\n")
        
        self.test_list_parceiros()
        self.test_get_parceiro_by_id()
        self.test_get_parceiro_not_found()
        self.test_create_parceiro()
        self.test_update_parceiro()
        self.test_delete_parceiro()
        self.test_get_nearby_parceiros()
        
        print("\n" + "="*60)
        print(f"📊 RESUMO: {self.results['passed']} ✅ | {self.results['failed']} ❌")
        print("="*60 + "\n")
        
        return self.results
