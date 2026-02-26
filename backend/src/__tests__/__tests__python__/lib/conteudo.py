"""
Conteudo Module Tests
Testes reais dos endpoints de conteúdo
"""

import requests
from typing import Optional


class TestConteudo:
    """Testes dos endpoints de conteúdo"""
    
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
    
    def test_list_conteudos(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/conteudos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                conteudos = response.json().get('data', [])
                self._print_test("GET /conteudos (Listar)", "PASS", f"Total: {len(conteudos)}")
                return True
            else:
                self._print_test("GET /conteudos (Listar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /conteudos (Listar)", "FAIL", str(e))
            return False
    
    def test_get_conteudo_by_id(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/conteudos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("GET /conteudos/:id (Obter)", "FAIL", "Erro ao listar")
                return False
            
            conteudos = response.json().get('data', [])
            if not conteudos:
                self._print_test("GET /conteudos/:id (Obter)", "FAIL", "Nenhum conteúdo")
                return False
            
            conteudo_id = conteudos[0].get('cnt_id')
            response = requests.get(
                f"{self.BASE_URL}/conteudos/{conteudo_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("GET /conteudos/:id (Obter)", "PASS", "Conteúdo encontrado")
                return True
            else:
                self._print_test("GET /conteudos/:id (Obter)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /conteudos/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_conteudo_not_found(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/conteudos/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 404:
                self._print_test("GET /conteudos/:id (Não Encontrado)", "PASS", "Retornou 404")
                return True
            else:
                self._print_test("GET /conteudos/:id (Não Encontrado)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /conteudos/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_conteudo(self) -> bool:
        try:
            if not self.tema_id:
                self._print_test("POST /conteudos (Criar)", "FAIL", "Nenhum tema disponível")
                return False
            
            import time
            conteudo_data = {
                "cnt_tem_id": self.tema_id,
                "cnt_tipo": "html",
                "cnt_categoria": "banner",
                "cnt_titulo": f"Conteúdo {int(time.time())}",
                "cnt_descricao": "Descrição do conteúdo"
            }
            response = requests.post(
                f"{self.BASE_URL}/conteudos",
                json=conteudo_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 201:
                self._print_test("POST /conteudos (Criar)", "PASS", "Conteúdo criado")
                return True
            else:
                self._print_test("POST /conteudos (Criar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("POST /conteudos (Criar)", "FAIL", str(e))
            return False
    
    def test_update_conteudo(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/conteudos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("PUT /conteudos/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            conteudos = response.json().get('data', [])
            if not conteudos:
                self._print_test("PUT /conteudos/:id (Atualizar)", "FAIL", "Nenhum conteúdo")
                return False
            
            conteudo = conteudos[-1]
            conteudo_id = conteudo.get('cnt_id')
            update_data = {
                "cnt_tem_id": conteudo.get('cnt_tem_id', self.tema_id),
                "cnt_tipo": conteudo.get('cnt_tipo', 'html'),
                "cnt_categoria": conteudo.get('cnt_categoria', 'banner'),
                "cnt_titulo": conteudo.get('cnt_titulo', 'Conteúdo'),
                "cnt_descricao": "Descrição atualizada"
            }
            response = requests.put(
                f"{self.BASE_URL}/conteudos/{conteudo_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("PUT /conteudos/:id (Atualizar)", "PASS", "Conteúdo atualizado")
                return True
            else:
                self._print_test("PUT /conteudos/:id (Atualizar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("PUT /conteudos/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_conteudo(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/conteudos",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("DELETE /conteudos/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            conteudos = response.json().get('data', [])
            if not conteudos:
                self._print_test("DELETE /conteudos/:id (Deletar)", "FAIL", "Nenhum conteúdo")
                return False
            
            conteudo_id = conteudos[-1].get('cnt_id')
            response = requests.delete(
                f"{self.BASE_URL}/conteudos/{conteudo_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code in [200, 204]:
                self._print_test("DELETE /conteudos/:id (Deletar)", "PASS", "Conteúdo deletado")
                return True
            else:
                self._print_test("DELETE /conteudos/:id (Deletar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("DELETE /conteudos/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        self.test_list_conteudos()
        self.test_get_conteudo_by_id()
        self.test_get_conteudo_not_found()
        self.test_create_conteudo()
        self.test_update_conteudo()
        self.test_delete_conteudo()
        return self.results
