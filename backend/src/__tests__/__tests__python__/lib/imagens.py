"""
Imagens Module Tests
Testes reais dos endpoints de imagens
"""

import requests
from typing import Optional


class TestImagens:
    """Testes dos endpoints de imagens"""
    
    BASE_URL = "http://localhost:3000/api/v1"
    
    def __init__(self):
        self.token: Optional[str] = None
        self.tema_id: Optional[str] = None
        self.results = {'passed': 0, 'failed': 0, 'errors': []}
    
    def _authenticate(self, shared_token: Optional[str] = None) -> bool:
        """Obter token de autenticação ou usar compartilhado"""
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
    
    def test_list_imagens(self) -> bool:
        """GET /imagens - Lista todas as imagens"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/imagens",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                imagens = response.json().get('data', [])
                self._print_test("GET /imagens (Listar)", "PASS", f"Total de imagens: {len(imagens)}")
                return True
            else:
                self._print_test("GET /imagens (Listar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /imagens (Listar)", "FAIL", str(e))
            return False
    
    def test_get_imagem_by_id(self) -> bool:
        """GET /imagens/:id - Busca imagem por ID"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/imagens",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("GET /imagens/:id (Obter)", "FAIL", "Não conseguiu listar")
                return False
            
            imagens = response.json().get('data', [])
            if not imagens:
                self._print_test("GET /imagens/:id (Obter)", "FAIL", "Nenhuma imagem disponível")
                return False
            
            imagem_id = imagens[0].get('img_id')
            response = requests.get(
                f"{self.BASE_URL}/imagens/{imagem_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("GET /imagens/:id (Obter)", "PASS", "Imagem encontrada")
                return True
            else:
                self._print_test("GET /imagens/:id (Obter)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /imagens/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_imagem_not_found(self) -> bool:
        """GET /imagens/:id - Testa 404"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/imagens/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 404:
                self._print_test("GET /imagens/:id (Não Encontrado)", "PASS", "Retornou 404")
                return True
            else:
                self._print_test("GET /imagens/:id (Não Encontrado)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /imagens/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_imagem(self) -> bool:
        """POST /imagens - Cria nova imagem"""
        try:
            if not self.tema_id:
                self._print_test("POST /imagens (Criar)", "FAIL", "Nenhum tema disponível")
                return False
            
            import time
            imagem_data = {
                "img_tem_id": self.tema_id,
                "img_categoria": "banner",
                "img_nome": f"IMG Teste {int(time.time())}",
                "img_valor": "https://example.com/test.jpg"
            }
            response = requests.post(
                f"{self.BASE_URL}/imagens",
                json=imagem_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 201:
                imagem_id = response.json().get('data', {}).get('img_id', '')
                self._print_test("POST /imagens (Criar)", "PASS", f"Imagem criada: {imagem_id[:8]}...")
                return True
            else:
                self._print_test("POST /imagens (Criar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("POST /imagens (Criar)", "FAIL", str(e))
            return False
    
    def test_update_imagem(self) -> bool:
        """PUT /imagens/:id - Atualiza imagem"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/imagens",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("PUT /imagens/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            imagens = response.json().get('data', [])
            if not imagens:
                self._print_test("PUT /imagens/:id (Atualizar)", "FAIL", "Nenhuma imagem")
                return False
            
            imagem = imagens[-1]
            imagem_id = imagem.get('img_id')
            update_data = {
                "img_tem_id": imagem.get('img_tem_id', self.tema_id),
                "img_categoria": imagem.get('img_categoria', 'banner'),
                "img_nome": imagem.get('img_nome', 'Imagem'),
                "img_valor": "https://example.com/updated.jpg"
            }
            response = requests.put(
                f"{self.BASE_URL}/imagens/{imagem_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("PUT /imagens/:id (Atualizar)", "PASS", "Imagem atualizada")
                return True
            else:
                self._print_test("PUT /imagens/:id (Atualizar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("PUT /imagens/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_imagem(self) -> bool:
        """DELETE /imagens/:id - Deleta imagem"""
        try:
            response = requests.get(
                f"{self.BASE_URL}/imagens",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("DELETE /imagens/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            imagens = response.json().get('data', [])
            if not imagens:
                self._print_test("DELETE /imagens/:id (Deletar)", "FAIL", "Nenhuma imagem")
                return False
            
            imagem_id = imagens[-1].get('img_id')
            response = requests.delete(
                f"{self.BASE_URL}/imagens/{imagem_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code in [200, 204]:
                self._print_test("DELETE /imagens/:id (Deletar)", "PASS", "Imagem deletada")
                return True
            else:
                self._print_test("DELETE /imagens/:id (Deletar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("DELETE /imagens/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        """Executa todos os testes"""
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return
        self.test_list_imagens()
        self.test_get_imagem_by_id()
        self.test_get_imagem_not_found()
        self.test_create_imagem()
        self.test_update_imagem()
        self.test_delete_imagem()
