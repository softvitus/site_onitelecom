"""
Cores Module Tests
Testes reais dos endpoints de cores
"""

import requests
import json
from typing import Dict, Optional


class TestCores:
    """Testes dos endpoints de cores"""
    
    BASE_URL = "http://localhost:3000/api/v1"
    
    def __init__(self):
        self.token: Optional[str] = None
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
            # Tentar como admin primeiro
            try:
                response = requests.post(
                    f"{self.BASE_URL}/auth/login",
                    json={
                        "email": "admin@siteoni.com.br",
                        "senha": "admin123"
                    },
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    self.token = data['data']['token']
                else:
                    return False
            except:
                return False
        
        # Obter primeiro tema para usar nos testes
        self._get_first_tema()
        return True if self.token else False
    
    def _get_first_tema(self) -> bool:
        """Obtem o primeiro tema para usar nos testes"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/temas",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data') and len(data['data']) > 0:
                    self.tema_id = data['data'][0].get('tem_id')
                    return True
        except:
            pass
        return False
    
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
    
    def test_list_cores(self) -> bool:
        """
        GET /cores
        Lista todas as cores
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/cores",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                cores = data.get('data', [])
                
                self._print_test(
                    "GET /cores (Listar)",
                    "PASS",
                    f"Total de cores: {len(cores)}"
                )
                return True
            else:
                self._print_test(
                    "GET /cores (Listar)",
                    "FAIL",
                    f"Status {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test("GET /cores (Listar)", "FAIL", str(e))
            return False
    
    def test_get_core_by_id(self) -> bool:
        """
        GET /cores/:id
        Busca cor por ID
        """
        try:
            # Primeiro listar para pegar um ID
            response = requests.get(
                f"{self.BASE_URL}/cores",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code != 200:
                self._print_test("GET /cores/:id (Obter)", "FAIL", "Não conseguiu listar")
                return False
            
            cores = response.json().get('data', [])
            if not cores:
                self._print_test("GET /cores/:id (Obter)", "FAIL", "Nenhuma cor disponível")
                return False
            
            core_id = cores[0].get('cor_id')
            
            response = requests.get(
                f"{self.BASE_URL}/cores/{core_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                self._print_test(
                    "GET /cores/:id (Obter)",
                    "PASS",
                    f"Cor encontrada"
                )
                return True
            else:
                self._print_test(
                    "GET /cores/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test("GET /cores/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_core_not_found(self) -> bool:
        """
        GET /cores/:id
        Testa 404 para cor inexistente
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/cores/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /cores/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para cor inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /cores/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test("GET /cores/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_core(self) -> bool:
        """
        POST /cores
        Cria nova cor
        """
        try:
            if not self.tema_id:
                self._print_test(
                    "POST /cores (Criar)",
                    "FAIL",
                    "Nenhum tema disponível"
                )
                return False
            
            core_data = {
                "cor_tem_id": self.tema_id,
                "cor_categoria": "primary",
                "cor_nome": f"Cor Teste {int(__import__('time').time())}",
                "cor_valor": "#FF5733"
            }
            
            response = requests.post(
                f"{self.BASE_URL}/cores",
                json=core_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                core_id = data.get('data', {}).get('cor_id', '')
                
                self._print_test(
                    "POST /cores (Criar)",
                    "PASS",
                    f"Cor criada com ID: {core_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /cores (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test("POST /cores (Criar)", "FAIL", str(e))
            return False
    
    def test_update_core(self) -> bool:
        """
        PUT /cores/:id
        Atualiza cor
        """
        try:
            # Obter última cor da lista
            response = requests.get(
                f"{self.BASE_URL}/cores",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code != 200:
                self._print_test("PUT /cores/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            cores = response.json().get('data', [])
            if not cores:
                self._print_test("PUT /cores/:id (Atualizar)", "FAIL", "Nenhuma cor disponível")
                return False
            
            core = cores[-1]  # Última cor
            core_id = core.get('cor_id')
            
            update_data = {
                "cor_tem_id": core.get('cor_tem_id', self.tema_id),
                "cor_categoria": core.get('cor_categoria', 'primary'),
                "cor_nome": core.get('cor_nome', 'Cor Atualizada'),
                "cor_valor": "#00FF00"
            }
            
            response = requests.put(
                f"{self.BASE_URL}/cores/{core_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                self._print_test(
                    "PUT /cores/:id (Atualizar)",
                    "PASS",
                    "Cor atualizada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /cores/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test("PUT /cores/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_core(self) -> bool:
        """
        DELETE /cores/:id
        Deleta cor
        """
        try:
            # Obter última cor da lista
            response = requests.get(
                f"{self.BASE_URL}/cores",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code != 200:
                self._print_test("DELETE /cores/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            cores = response.json().get('data', [])
            if not cores:
                self._print_test("DELETE /cores/:id (Deletar)", "FAIL", "Nenhuma cor disponível")
                return False
            
            core_id = cores[-1].get('cor_id')
            
            response = requests.delete(
                f"{self.BASE_URL}/cores/{core_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code in [200, 204]:
                self._print_test(
                    "DELETE /cores/:id (Deletar)",
                    "PASS",
                    "Cor deletada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /cores/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test("DELETE /cores/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        """Executa todos os testes de cores"""
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return
        
        self.test_list_cores()
        self.test_get_core_by_id()
        self.test_get_core_not_found()
        self.test_create_core()
        self.test_update_core()
        self.test_delete_core()
