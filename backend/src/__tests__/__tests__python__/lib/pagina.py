"""
Página Module Tests
Testes dos endpoints de Página (CRUD)
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN, TEST_TEMA_ID


class TestPagina:
    """Testes dos endpoints de Página"""
    
        
    def __init__(self):
        self.token: Optional[str] = None
        self.pagina_id: Optional[str] = None
        self.test_pagina_id: Optional[str] = None
        self.tema_id: Optional[str] = None
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
    
    def _get_first_parceiro(self):
        """Obtem o primeiro parceiro para usar nos testes"""
        try:
            response = requests.get(
                f"{BASE_URL}/parceiros",
                headers=self._get_headers(),
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data') and len(data['data']) > 0:
                    self.parceiro_id = data['data'][0].get('par_id')
        except Exception as e:
            # Se não conseguir obter o parceiro, usar um ID padrão
            self.parceiro_id = "550e8400-e29b-41d4-a716-446655440001"
    
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
    
    def test_list_paginas(self) -> bool:
        """
        GET /paginas
        Testa listagem de todas as páginas
        """
        try:
            response = requests.get(
                f"{BASE_URL}/paginas",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                paginas_list = data['data'] if isinstance(data['data'], list) else []
                paginas_count = len(paginas_list)
                
                # Capturar ID da primeira página para usar nos testes
                if paginas_count > 0:
                    self.test_pagina_id = paginas_list[0].get('pag_id')
                
                self._print_test(
                    "GET /paginas (Listar)",
                    "PASS",
                    f"Total de páginas: {paginas_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /paginas (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /paginas (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_pagina_by_id(self) -> bool:
        """
        GET /paginas/:id
        Testa busca de página por ID
        """
        try:
            # Usar o ID capturado da listagem
            pagina_id = self.test_pagina_id
            
            if not pagina_id:
                self._print_test(
                    "GET /paginas/:id (Obter)",
                    "SKIP",
                    "Nenhuma página disponível para teste"
                )
                return False
            
            response = requests.get(
                f"{BASE_URL}/paginas/{pagina_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('pag_id') == pagina_id, "ID não corresponde"
                
                pagina_nome = data['data'].get('pag_nome', 'Unknown')
                
                self._print_test(
                    "GET /paginas/:id (Obter)",
                    "PASS",
                    f"Página: {pagina_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /paginas/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /paginas/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_pagina_not_found(self) -> bool:
        """
        GET /paginas/:id
        Testa 404 para página inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            response = requests.get(
                f"{BASE_URL}/paginas/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /paginas/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para página inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /paginas/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /paginas/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_pagina(self) -> bool:
        """
        POST /paginas
        Testa criação de nova página
        """
        try:
            pagina_data = {
                "pag_nome": "Página Teste",
                "pag_titulo": "Página de Teste",
                "pag_descricao": "Página criada durante testes de integração",
                "pag_slug": "pagina-teste",
                "pag_caminho": "/pagina-teste",
                "pag_status": "ativo",
                "pag_tem_id": self.tema_id,
                "pag_par_id": self.parceiro_id
            }
            
            response = requests.post(
                f"{BASE_URL}/paginas",
                json=pagina_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('pag_id'), "ID não retornado"
                
                self.pagina_id = data['data'].get('pag_id')
                
                self._print_test(
                    "POST /paginas (Criar)",
                    "PASS",
                    f"Página criada com ID: {self.pagina_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /paginas (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /paginas (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_pagina(self) -> bool:
        """
        PUT /paginas/:id
        Testa atualização de página
        """
        try:
            if not self.pagina_id:
                self._print_test(
                    "PUT /paginas/:id (Atualizar)",
                    "SKIP",
                    "Página não foi criada"
                )
                return False
            
            update_data = {
                "pag_descricao": "Descrição atualizada durante testes"
            }
            
            response = requests.put(
                f"{BASE_URL}/paginas/{self.pagina_id}",
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
                    "PUT /paginas/:id (Atualizar)",
                    "PASS",
                    "Página atualizada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /paginas/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /paginas/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_pagina(self) -> bool:
        """
        DELETE /paginas/:id
        Testa exclusão de página
        """
        try:
            if not self.pagina_id:
                self._print_test(
                    "DELETE /paginas/:id (Deletar)",
                    "SKIP",
                    "Página não foi criada"
                )
                return False
            
            response = requests.delete(
                f"{BASE_URL}/paginas/{self.pagina_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 204 or response.status_code == 200:
                self._print_test(
                    "DELETE /paginas/:id (Deletar)",
                    "PASS",
                    "Página deletada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /paginas/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /paginas/:id (Deletar)",
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
        print("🎨 TESTES DE PÁGINA (PÁGINA)")
        print("="*60 + "\n")
        
        # Obter IDs necessários para criar página
        self._get_first_tema()
        self._get_first_parceiro()
        
        self.test_list_paginas()  # Precisa rodar primeiro para capturar o ID
        self.test_get_pagina_by_id()
        self.test_get_pagina_not_found()
        self.test_create_pagina()
        self.test_update_pagina()
        self.test_delete_pagina()
        
        return self.results
