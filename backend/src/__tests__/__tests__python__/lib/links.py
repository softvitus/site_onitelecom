"""
Links Module Tests
Testes reais dos endpoints de links
"""

import requests
from typing import Optional


class TestLinks:
    """Testes dos endpoints de links"""
    
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
        
        # Delay entre testes para evitar rate limit
        import time
        time.sleep(0.5)
    
    def test_list_links(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/links",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                links = response.json().get('data', [])
                self._print_test("GET /links (Listar)", "PASS", f"Total: {len(links)}")
                return True
            else:
                self._print_test("GET /links (Listar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /links (Listar)", "FAIL", str(e))
            return False
    
    def test_get_link_by_id(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/links",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("GET /links/:id (Obter)", "FAIL", "Erro ao listar")
                return False
            
            links = response.json().get('data', [])
            if not links:
                self._print_test("GET /links/:id (Obter)", "FAIL", "Nenhum link")
                return False
            
            link_id = links[0].get('lin_id')
            response = requests.get(
                f"{self.BASE_URL}/links/{link_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("GET /links/:id (Obter)", "PASS", "Link encontrado")
                return True
            else:
                self._print_test("GET /links/:id (Obter)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /links/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_link_not_found(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/links/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 404:
                self._print_test("GET /links/:id (Não Encontrado)", "PASS", "Retornou 404")
                return True
            else:
                self._print_test("GET /links/:id (Não Encontrado)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /links/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_link(self) -> bool:
        try:
            if not self.tema_id:
                self._print_test("POST /links (Criar)", "FAIL", "Nenhum tema disponível")
                return False
            
            import time
            link_data = {
                "lin_tem_id": self.tema_id,
                "lin_categoria": "social",
                "lin_nome": f"Link {int(time.time())}",
                "lin_valor": "https://example.com/test"
            }
            response = requests.post(
                f"{self.BASE_URL}/links",
                json=link_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 201:
                self._print_test("POST /links (Criar)", "PASS", "Link criado")
                return True
            else:
                self._print_test("POST /links (Criar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("POST /links (Criar)", "FAIL", str(e))
            return False
    
    def test_update_link(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/links",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("PUT /links/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            links = response.json().get('data', [])
            if not links:
                self._print_test("PUT /links/:id (Atualizar)", "FAIL", "Nenhum link")
                return False
            
            link = links[-1]
            link_id = link.get('lin_id')
            update_data = {
                "lin_tem_id": link.get('lin_tem_id', self.tema_id),
                "lin_categoria": link.get('lin_categoria', 'social'),
                "lin_nome": link.get('lin_nome', 'Link'),
                "lin_valor": "https://example.com/updated"
            }
            response = requests.put(
                f"{self.BASE_URL}/links/{link_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("PUT /links/:id (Atualizar)", "PASS", "Link atualizado")
                return True
            else:
                self._print_test("PUT /links/:id (Atualizar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("PUT /links/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_link(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/links",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("DELETE /links/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            links = response.json().get('data', [])
            if not links:
                self._print_test("DELETE /links/:id (Deletar)", "FAIL", "Nenhum link")
                return False
            
            link_id = links[-1].get('lin_id')
            response = requests.delete(
                f"{self.BASE_URL}/links/{link_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code in [200, 204]:
                self._print_test("DELETE /links/:id (Deletar)", "PASS", "Link deletado")
                return True
            else:
                self._print_test("DELETE /links/:id (Deletar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("DELETE /links/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return
        self.test_list_links()
        self.test_get_link_by_id()
        self.test_get_link_not_found()
        self.test_create_link()
        self.test_update_link()
        self.test_delete_link()
