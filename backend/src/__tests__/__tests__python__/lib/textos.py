"""
Textos Module Tests
Testes reais dos endpoints de textos
"""

import requests
from typing import Optional


class TestTextos:
    """Testes dos endpoints de textos"""
    
    BASE_URL = "http://localhost:3000/api/v1"
    
    def __init__(self):
        self.token: Optional[str] = None
        self.tema_id: Optional[str] = None
        self.results = {'passed': 0, 'failed': 0, 'errors': []}
    
    def _authenticate(self, shared_token: Optional[str] = None) -> bool:
        if shared_token:
            self.token = shared_token
        else:
            try:
                response = requests.post(
                    f"{self.BASE_URL}/auth/login",
                    json={"email": "admin@siteoni.com.br", "senha": "admin123"},
                    timeout=5
                )
                if response.status_code == 200:
                    self.token = response.json()['data']['token']
                else:
                    return False
            except:
                return False
        
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
        symbol = "✅" if status == "PASS" else "❌"
        print(f"{symbol} {name}: {status}")
        if details:
            print(f"   └─ {details}")
        if status == "PASS":
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
    
    def test_list_textos(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/textos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                textos = response.json().get('data', [])
                self._print_test("GET /textos (Listar)", "PASS", f"Total: {len(textos)}")
                return True
            else:
                self._print_test("GET /textos (Listar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /textos (Listar)", "FAIL", str(e))
            return False
    
    def test_get_texto_by_id(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/textos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("GET /textos/:id (Obter)", "FAIL", "Erro ao listar")
                return False
            
            textos = response.json().get('data', [])
            if not textos:
                self._print_test("GET /textos/:id (Obter)", "FAIL", "Nenhum texto")
                return False
            
            texto_id = textos[0].get('txt_id')
            response = requests.get(
                f"{self.BASE_URL}/textos/{texto_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("GET /textos/:id (Obter)", "PASS", "Texto encontrado")
                return True
            else:
                self._print_test("GET /textos/:id (Obter)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /textos/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_texto_not_found(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/textos/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 404:
                self._print_test("GET /textos/:id (Não Encontrado)", "PASS", "Retornou 404")
                return True
            else:
                self._print_test("GET /textos/:id (Não Encontrado)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /textos/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_texto(self) -> bool:
        try:
            if not self.tema_id:
                self._print_test("POST /textos (Criar)", "FAIL", "Nenhum tema disponível")
                return False
            
            import time
            texto_data = {
                "txt_tem_id": self.tema_id,
                "txt_categoria": "label",
                "txt_chave": f"texto_{int(time.time())}",
                "txt_valor": "Valor do texto teste"
            }
            response = requests.post(
                f"{self.BASE_URL}/textos",
                json=texto_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 201:
                self._print_test("POST /textos (Criar)", "PASS", "Texto criado")
                return True
            else:
                self._print_test("POST /textos (Criar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("POST /textos (Criar)", "FAIL", str(e))
            return False
    
    def test_update_texto(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/textos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("PUT /textos/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            textos = response.json().get('data', [])
            if not textos:
                self._print_test("PUT /textos/:id (Atualizar)", "FAIL", "Nenhum texto")
                return False
            
            texto = textos[-1]
            texto_id = texto.get('txt_id')
            update_data = {
                "txt_tem_id": texto.get('txt_tem_id', self.tema_id),
                "txt_categoria": texto.get('txt_categoria', 'label'),
                "txt_chave": texto.get('txt_chave', 'texto'),
                "txt_valor": "Valor atualizado"
            }
            response = requests.put(
                f"{self.BASE_URL}/textos/{texto_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("PUT /textos/:id (Atualizar)", "PASS", "Texto atualizado")
                return True
            else:
                self._print_test("PUT /textos/:id (Atualizar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("PUT /textos/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_texto(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/textos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("DELETE /textos/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            textos = response.json().get('data', [])
            if not textos:
                self._print_test("DELETE /textos/:id (Deletar)", "FAIL", "Nenhum texto")
                return False
            
            texto_id = textos[-1].get('txt_id')
            response = requests.delete(
                f"{self.BASE_URL}/textos/{texto_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code in [200, 204]:
                self._print_test("DELETE /textos/:id (Deletar)", "PASS", "Texto deletado")
                return True
            else:
                self._print_test("DELETE /textos/:id (Deletar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("DELETE /textos/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        self.test_list_textos()
        self.test_get_texto_by_id()
        self.test_get_texto_not_found()
        self.test_create_texto()
        self.test_update_texto()
        self.test_delete_texto()
        return self.results
