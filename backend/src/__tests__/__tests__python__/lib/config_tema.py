"""
ConfigTema Module Tests
Testes reais dos endpoints de configuração de tema
"""

import requests
from typing import Optional


class TestConfigTema:
    """Testes dos endpoints de config-temas"""
    
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
    
    def test_list_config_temas(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/config-temas",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                configs = response.json().get('data', [])
                self._print_test("GET /config-temas (Listar)", "PASS", f"Total: {len(configs)}")
                return True
            else:
                self._print_test("GET /config-temas (Listar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /config-temas (Listar)", "FAIL", str(e))
            return False
    
    def test_get_config_tema_by_id(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/config-temas",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("GET /config-temas/:id (Obter)", "FAIL", "Erro ao listar")
                return False
            
            configs = response.json().get('data', [])
            if not configs:
                self._print_test("GET /config-temas/:id (Obter)", "FAIL", "Nenhuma config")
                return False
            
            config_id = configs[0].get('cfg_id')
            response = requests.get(
                f"{self.BASE_URL}/config-temas/{config_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("GET /config-temas/:id (Obter)", "PASS", "Config encontrada")
                return True
            else:
                self._print_test("GET /config-temas/:id (Obter)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /config-temas/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_config_tema_not_found(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/config-temas/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 404:
                self._print_test("GET /config-temas/:id (Não Encontrado)", "PASS", "Retornou 404")
                return True
            else:
                self._print_test("GET /config-temas/:id (Não Encontrado)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /config-temas/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_config_tema(self) -> bool:
        try:
            if not self.tema_id:
                self._print_test("POST /config-temas (Criar)", "FAIL", "Nenhum tema disponível")
                return False
            
            import time
            config_data = {
                "cfg_tem_id": self.tema_id,
                "cfg_chave": f"config_{int(time.time())}",
                "cfg_valor": "valor_teste"
            }
            response = requests.post(
                f"{self.BASE_URL}/config-temas",
                json=config_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 201:
                self._print_test("POST /config-temas (Criar)", "PASS", "Config criada")
                return True
            else:
                self._print_test("POST /config-temas (Criar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("POST /config-temas (Criar)", "FAIL", str(e))
            return False
    
    def test_update_config_tema(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/config-temas",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("PUT /config-temas/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            configs = response.json().get('data', [])
            if not configs:
                self._print_test("PUT /config-temas/:id (Atualizar)", "FAIL", "Nenhuma config")
                return False
            
            config = configs[-1]
            config_id = config.get('cfg_id')
            update_data = {
                "cfg_tem_id": config.get('cfg_tem_id', self.tema_id),
                "cfg_chave": config.get('cfg_chave', 'config'),
                "cfg_valor": "valor_atualizado"
            }
            response = requests.put(
                f"{self.BASE_URL}/config-temas/{config_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("PUT /config-temas/:id (Atualizar)", "PASS", "Config atualizada")
                return True
            else:
                self._print_test("PUT /config-temas/:id (Atualizar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("PUT /config-temas/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_config_tema(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/config-temas",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("DELETE /config-temas/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            configs = response.json().get('data', [])
            if not configs:
                self._print_test("DELETE /config-temas/:id (Deletar)", "FAIL", "Nenhuma config")
                return False
            
            config_id = configs[-1].get('cfg_id')
            response = requests.delete(
                f"{self.BASE_URL}/config-temas/{config_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code in [200, 204]:
                self._print_test("DELETE /config-temas/:id (Deletar)", "PASS", "Config deletada")
                return True
            else:
                self._print_test("DELETE /config-temas/:id (Deletar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("DELETE /config-temas/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        self.test_list_config_temas()
        self.test_get_config_tema_by_id()
        self.test_get_config_tema_not_found()
        self.test_create_config_tema()
        self.test_update_config_tema()
        self.test_delete_config_tema()
        return self.results
