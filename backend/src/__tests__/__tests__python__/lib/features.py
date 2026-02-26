"""
Features Module Tests
Testes reais dos endpoints de features
"""

import requests
from typing import Optional


class TestFeatures:
    """Testes dos endpoints de features"""
    
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
    
    def test_list_features(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/features",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                features = response.json().get('data', [])
                self._print_test("GET /features (Listar)", "PASS", f"Total: {len(features)}")
                return True
            else:
                self._print_test("GET /features (Listar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /features (Listar)", "FAIL", str(e))
            return False
    
    def test_get_feature_by_id(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/features",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("GET /features/:id (Obter)", "FAIL", "Erro ao listar")
                return False
            
            features = response.json().get('data', [])
            if not features:
                self._print_test("GET /features/:id (Obter)", "FAIL", "Nenhuma feature")
                return False
            
            feature_id = features[0].get('fea_id')
            response = requests.get(
                f"{self.BASE_URL}/features/{feature_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("GET /features/:id (Obter)", "PASS", "Feature encontrada")
                return True
            else:
                self._print_test("GET /features/:id (Obter)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /features/:id (Obter)", "FAIL", str(e))
            return False
    
    def test_get_feature_not_found(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/features/00000000-0000-0000-0000-000000000000",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 404:
                self._print_test("GET /features/:id (Não Encontrado)", "PASS", "Retornou 404")
                return True
            else:
                self._print_test("GET /features/:id (Não Encontrado)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("GET /features/:id (Não Encontrado)", "FAIL", str(e))
            return False
    
    def test_create_feature(self) -> bool:
        try:
            if not self.tema_id:
                self._print_test("POST /features (Criar)", "FAIL", "Nenhum tema disponível")
                return False
            
            import time
            feature_data = {
                "fea_tem_id": self.tema_id,
                "fea_nome": f"Feature {int(time.time())}"
            }
            response = requests.post(
                f"{self.BASE_URL}/features",
                json=feature_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 201:
                self._print_test("POST /features (Criar)", "PASS", "Feature criada")
                return True
            else:
                self._print_test("POST /features (Criar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("POST /features (Criar)", "FAIL", str(e))
            return False
    
    def test_update_feature(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/features",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("PUT /features/:id (Atualizar)", "FAIL", "Erro ao listar")
                return False
            
            features = response.json().get('data', [])
            if not features:
                self._print_test("PUT /features/:id (Atualizar)", "FAIL", "Nenhuma feature")
                return False
            
            feature = features[-1]
            feature_id = feature.get('fea_id')
            update_data = {
                "fea_tem_id": feature.get('fea_tem_id', self.tema_id),
                "fea_nome": feature.get('fea_nome', 'Feature')
            }
            response = requests.put(
                f"{self.BASE_URL}/features/{feature_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self._print_test("PUT /features/:id (Atualizar)", "PASS", "Feature atualizada")
                return True
            else:
                self._print_test("PUT /features/:id (Atualizar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("PUT /features/:id (Atualizar)", "FAIL", str(e))
            return False
    
    def test_delete_feature(self) -> bool:
        try:
            response = requests.get(
                f"{self.BASE_URL}/features",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code != 200:
                self._print_test("DELETE /features/:id (Deletar)", "FAIL", "Erro ao listar")
                return False
            
            features = response.json().get('data', [])
            if not features:
                self._print_test("DELETE /features/:id (Deletar)", "FAIL", "Nenhuma feature")
                return False
            
            feature_id = features[-1].get('fea_id')
            response = requests.delete(
                f"{self.BASE_URL}/features/{feature_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code in [200, 204]:
                self._print_test("DELETE /features/:id (Deletar)", "PASS", "Feature deletada")
                return True
            else:
                self._print_test("DELETE /features/:id (Deletar)", "FAIL", f"Status {response.status_code}")
                return False
        except Exception as e:
            self._print_test("DELETE /features/:id (Deletar)", "FAIL", str(e))
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        self.test_list_features()
        self.test_get_feature_by_id()
        self.test_get_feature_not_found()
        self.test_create_feature()
        self.test_update_feature()
        self.test_delete_feature()
        return self.results
