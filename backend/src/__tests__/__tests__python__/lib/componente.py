"""
Componente Module Tests
Testes dos endpoints de Componente (CRUD)
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN, TEST_TEMA_ID


class TestComponente:
    """Testes dos endpoints de Componente"""
    
        
    def __init__(self):
        self.token: Optional[str] = None
        self.componente_id: Optional[str] = None
        self.test_componente_id: Optional[str] = None
        self.tema_id: Optional[str] = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def _authenticate(self, shared_token: Optional[str] = None) -> bool:
        """Obter token de autenticação ou usar compartilhado"""
        if shared_token:
            self.token = shared_token
        else:
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
                else:
                    return False
            except Exception as e:
                print(f"❌ Erro ao fazer login: {e}")
                return False
        
        return True if self.token else False
    
    def _get_headers(self):
        """Retorna headers com token de autenticação"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        } if self.token else {"Content-Type": "application/json"}
    
    def _get_first_tema(self):
        """Obtem o primeiro tema para usar nos testes"""
        try:
            response = requests.get(
                f"{BASE_URL}/temas",
                headers=self._get_headers(),
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data') and len(data['data']) > 0:
                    self.tema_id = data['data'][0].get('tem_id')
        except Exception as e:
            # Se não conseguir obter o tema, usar um ID padrão
            self.tema_id = "660e8400-e29b-41d4-a716-446655440001"
    
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
    
    def test_list_componentes(self) -> bool:
        """
        GET /componentes
        Testa listagem de todos os componentes
        """
        try:
            response = requests.get(
                f"{BASE_URL}/componentes",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                componentes_list = data['data'] if isinstance(data['data'], list) else []
                componentes_count = len(componentes_list)
                
                # Capturar ID do primeiro componente para usar nos testes
                if componentes_count > 0:
                    self.test_componente_id = componentes_list[0].get('com_id')
                
                self._print_test(
                    "GET /componentes (Listar)",
                    "PASS",
                    f"Total de componentes: {componentes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /componentes (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /componentes (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_componente_by_id(self) -> bool:
        """
        GET /componentes/:id
        Testa busca de componente por ID
        """
        try:
            # Usar o ID capturado da listagem
            componente_id = self.test_componente_id
            
            if not componente_id:
                self._print_test(
                    "GET /componentes/:id (Obter)",
                    "SKIP",
                    "Nenhum componente disponível para teste"
                )
                return False
            
            response = requests.get(
                f"{BASE_URL}/componentes/{componente_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('com_id') == componente_id, "ID não corresponde"
                
                componente_nome = data['data'].get('com_nome', 'Unknown')
                
                self._print_test(
                    "GET /componentes/:id (Obter)",
                    "PASS",
                    f"Componente: {componente_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /componentes/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /componentes/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_componente_not_found(self) -> bool:
        """
        GET /componentes/:id
        Testa 404 para componente inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            response = requests.get(
                f"{BASE_URL}/componentes/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /componentes/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para componente inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /componentes/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /componentes/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_componente(self) -> bool:
        """
        POST /componentes
        Testa criação de novo componente
        """
        try:
            componente_data = {
                "com_nome": "Componente Teste",
                "com_descricao": "Componente criado durante testes de integração",
                "com_tipo": "global",
                "com_possui_elementos": False
            }
            
            response = requests.post(
                f"{BASE_URL}/componentes",
                json=componente_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('com_id'), "ID não retornado"
                
                self.componente_id = data['data'].get('com_id')
                
                self._print_test(
                    "POST /componentes (Criar)",
                    "PASS",
                    f"Componente criado com ID: {self.componente_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /componentes (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /componentes (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_componente(self) -> bool:
        """
        PUT /componentes/:id
        Testa atualização de componente
        """
        try:
            if not self.componente_id:
                self._print_test(
                    "PUT /componentes/:id (Atualizar)",
                    "SKIP",
                    "Componente não foi criado"
                )
                return False
            
            update_data = {
                "com_descricao": "Descrição atualizada durante testes"
            }
            
            response = requests.put(
                f"{BASE_URL}/componentes/{self.componente_id}",
                json=update_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                self._print_test(
                    "PUT /componentes/:id (Atualizar)",
                    "PASS",
                    "Componente atualizado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /componentes/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /componentes/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_componente(self) -> bool:
        """
        DELETE /componentes/:id
        Testa exclusão de componente
        """
        try:
            if not self.componente_id:
                self._print_test(
                    "DELETE /componentes/:id (Deletar)",
                    "SKIP",
                    "Componente não foi criado"
                )
                return False
            
            response = requests.delete(
                f"{BASE_URL}/componentes/{self.componente_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 204 or response.status_code == 200:
                self._print_test(
                    "DELETE /componentes/:id (Deletar)",
                    "PASS",
                    "Componente deletado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /componentes/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /componentes/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        
        """Executa todos os testes"""
        print("\n" + "="*60)
        print("🎨 TESTES DE COMPONENTE (COMPONENTE)")
        print("="*60 + "\n")
        self.test_list_componentes()  # Precisa rodar primeiro para capturar o ID
        self.test_get_componente_by_id()
        self.test_get_componente_not_found()
        self.test_create_componente()
        self.test_update_componente()
        self.test_delete_componente()
        
        return self.results
