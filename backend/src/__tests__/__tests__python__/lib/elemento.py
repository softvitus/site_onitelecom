import requests
import json
from datetime import datetime
from typing import Optional
from config import BASE_URL


class TestElemento:
    """
    Classe para testes de integração do módulo ELEMENTO
    Testa operações CRUD para elementos
    """
    
    ADMIN_EMAIL = "admin@siteoni.com.br"
    ADMIN_PASSWORD = "admin123"
    
    # ID capturado durante listagem para usar nos testes
    test_elemento_id = None
    elemento_id = None
    
    # Token de autenticação
    token = None
    
    def __init__(self):
        """Inicializa o testador e realiza autenticação"""
        self.results = {'passed': 0, 'failed': 0, 'errors': []}
        self._authenticate()
    
    def _authenticate(self, shared_token: Optional[str] = None):
        """Realiza login como admin para obter token ou usa token compartilhado"""
        if shared_token:
            self.token = shared_token
            return
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": self.ADMIN_EMAIL,
                    "senha": self.ADMIN_PASSWORD
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('data', {}).get('token')
            else:
                print(f"⚠️  Falha na autenticação: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️  Erro de autenticação: {str(e)}")
    
    def _get_headers(self):
        """Retorna headers com token de autenticação"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def _print_test(self, name: str, status: str, details: str = ""):
        """
        Exibe resultado do teste formatado
        
        Args:
            name: Nome do teste
            status: PASS, FAIL ou SKIP
            details: Detalhes adicionais
        """
        emoji_map = {
            "PASS": "✅",
            "FAIL": "❌",
            "SKIP": "⏭️ "
        }
        
        emoji = emoji_map.get(status, "❓")
        print(f"{emoji} {name}: {status}")
        
        if details:
            print(f"   └─ {details}")
        
        if status == "PASS":
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{name}: {details}")
    
    def test_list_elementos(self) -> bool:
        """
        GET /elementos
        Testa listagem de todos os elementos
        """
        try:
            response = requests.get(
                f"{BASE_URL}/elementos",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                elementos_list = data['data'] if isinstance(data['data'], list) else []
                elementos_count = len(elementos_list)
                
                # Capturar ID do primeiro elemento para usar nos testes
                if elementos_count > 0:
                    self.test_elemento_id = elementos_list[0].get('ele_id')
                
                self._print_test(
                    "GET /elementos (Listar)",
                    "PASS",
                    f"Total de elementos: {elementos_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /elementos (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /elementos (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_elemento_by_id(self) -> bool:
        """
        GET /elementos/:id
        Testa busca de elemento por ID
        """
        try:
            # Usar o ID capturado da listagem
            elemento_id = self.test_elemento_id
            
            if not elemento_id:
                self._print_test(
                    "GET /elementos/:id (Obter)",
                    "SKIP",
                    "Nenhum elemento disponível para teste"
                )
                return False
            
            response = requests.get(
                f"{BASE_URL}/elementos/{elemento_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                elemento_nome = data['data'].get('ele_nome', 'desconhecido')
                
                self._print_test(
                    "GET /elementos/:id (Obter)",
                    "PASS",
                    f"Elemento: {elemento_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /elementos/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /elementos/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_elemento_not_found(self) -> bool:
        """
        GET /elementos/:id
        Testa 404 para elemento inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            response = requests.get(
                f"{BASE_URL}/elementos/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /elementos/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para elemento inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /elementos/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /elementos/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_elemento(self) -> bool:
        """
        POST /elementos
        Testa criação de novo elemento
        """
        try:
            elemento_data = {
                "ele_nome": "Elemento Teste",
                "ele_descricao": "Elemento criado durante testes de integração",
                "ele_obrigatório": False
            }
            
            response = requests.post(
                f"{BASE_URL}/elementos",
                json=elemento_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('ele_id'), "ID não retornado"
                
                self.elemento_id = data['data'].get('ele_id')
                
                self._print_test(
                    "POST /elementos (Criar)",
                    "PASS",
                    f"Elemento criado com ID: {self.elemento_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /elementos (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /elementos (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_elemento(self) -> bool:
        """
        PUT /elementos/:id
        Testa atualização de elemento
        """
        try:
            if not self.elemento_id:
                self._print_test(
                    "PUT /elementos/:id (Atualizar)",
                    "SKIP",
                    "Elemento não foi criado"
                )
                return False
            
            update_data = {
                "ele_nome": "Elemento Teste Atualizado",
                "ele_descricao": "Descrição atualizada",
                "ele_obrigatório": True
            }
            
            response = requests.put(
                f"{BASE_URL}/elementos/{self.elemento_id}",
                json=update_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data['data'].get('ele_nome') == "Elemento Teste Atualizado", "Nome não foi atualizado"
                
                self._print_test(
                    "PUT /elementos/:id (Atualizar)",
                    "PASS",
                    "Elemento atualizado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /elementos/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /elementos/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_elemento(self) -> bool:
        """
        DELETE /elementos/:id
        Testa deleção de elemento
        """
        try:
            if not self.elemento_id:
                self._print_test(
                    "DELETE /elementos/:id (Deletar)",
                    "SKIP",
                    "Elemento não foi criado"
                )
                return False
            
            response = requests.delete(
                f"{BASE_URL}/elementos/{self.elemento_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code in [200, 204]:
                self._print_test(
                    "DELETE /elementos/:id (Deletar)",
                    "PASS",
                    "Elemento deletado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /elementos/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /elementos/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None) -> dict:
        """
        Executa todos os testes de elemento
        
        Args:
            shared_token: Token de autenticação compartilhado (opcional)
        
        Returns:
            Dicionário com resultados (passed, failed, errors)
        """
        self._authenticate(shared_token)
        
        print("\n✅ Executando testes de ELEMENTO...\n")
        
        # Executar testes em ordem
        self.test_list_elementos()
        self.test_get_elemento_by_id()
        self.test_get_elemento_not_found()
        self.test_create_elemento()
        self.test_update_elemento()
        self.test_delete_elemento()
        
        return self.results
