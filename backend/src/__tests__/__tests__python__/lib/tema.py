"""
Tema Module Tests
Testes dos endpoints de Tema (CRUD)
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN, TEST_TEMA_ID


class TestTema:
    """Testes dos endpoints de Tema"""
    
    def __init__(self):
        self.token: Optional[str] = None
        self.tema_id: Optional[str] = None
        self.test_tema_id: Optional[str] = None
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
        
        # Obter primeiro parceiro para usar nos testes
        return True if self.token else False
    
    def _get_headers(self) -> Dict:
        """Retorna headers com token de autenticação"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        } if self.token else {"Content-Type": "application/json"}
    
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
    
    def test_list_temas(self) -> bool:
        """
        GET /temas
        Testa listagem de todos os temas
        """
        try:
            response = requests.get(
                f"{BASE_URL}/temas",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                temas_list = data['data'] if isinstance(data['data'], list) else []
                temas_count = len(temas_list)
                
                # Capturar ID do primeiro tema para usar nos testes
                if temas_count > 0:
                    self.test_tema_id = temas_list[0].get('tem_id')
                
                self._print_test(
                    "GET /temas (Listar)",
                    "PASS",
                    f"Total de temas: {temas_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /temas (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /temas (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_tema_by_id(self) -> bool:
        """
        GET /temas/:id
        Testa busca de tema por ID
        """
        try:
            # Usar o ID capturado da listagem
            tema_id = self.test_tema_id or self.TEST_TEMA_ID
            response = requests.get(
                f"{BASE_URL}/temas/{tema_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('tem_id') == tema_id, "ID não corresponde"
                
                tema_nome = data['data'].get('tem_nome', 'Unknown')
                
                self._print_test(
                    "GET /temas/:id (Obter)",
                    "PASS",
                    f"Tema: {tema_nome}"
                )
                return True
            else:
                self._print_test(
                    "GET /temas/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /temas/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_tema_not_found(self) -> bool:
        """
        GET /temas/:id
        Testa 404 para tema inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            response = requests.get(
                f"{BASE_URL}/temas/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /temas/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para tema inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /temas/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /temas/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_tema(self) -> bool:
        """
        POST /temas
        Testa criação de novo tema
        """
        try:
            tema_data = {
                "tem_nome": "Tema Teste",
                "tem_descricao": "Tema criado durante testes de integração",
                "tem_status": "ativo",
                "tem_par_id": self.parceiro_id
            }
            
            response = requests.post(
                f"{BASE_URL}/temas",
                json=tema_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('tem_id'), "ID não retornado"
                
                self.tema_id = data['data'].get('tem_id')
                
                self._print_test(
                    "POST /temas (Criar)",
                    "PASS",
                    f"Tema criado com ID: {self.tema_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /temas (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /temas (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_tema(self) -> bool:
        """
        PUT /temas/:id
        Testa atualização de tema
        """
        try:
            if not self.tema_id:
                self._print_test(
                    "PUT /temas/:id (Atualizar)",
                    "SKIP",
                    "Tema não foi criado"
                )
                return False
            
            update_data = {
                "tem_descricao": "Descrição atualizada durante testes"
            }
            
            response = requests.put(
                f"{BASE_URL}/temas/{self.tema_id}",
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
                    "PUT /temas/:id (Atualizar)",
                    "PASS",
                    "Tema atualizado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /temas/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /temas/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_tema(self) -> bool:
        """
        DELETE /temas/:id
        Testa exclusão de tema
        """
        try:
            if not self.tema_id:
                self._print_test(
                    "DELETE /temas/:id (Deletar)",
                    "SKIP",
                    "Tema não foi criado"
                )
                return False
            
            response = requests.delete(
                f"{BASE_URL}/temas/{self.tema_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 204 or response.status_code == 200:
                self._print_test(
                    "DELETE /temas/:id (Deletar)",
                    "PASS",
                    "Tema deletado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /temas/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /temas/:id (Deletar)",
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
        print("🎨 TESTES DE TEMA (TEMA)")
        print("="*60 + "\n")
        
        # Obter IDs necessários para criar tema
        self._get_first_parceiro()
        
        self.test_list_temas()  # Precisa rodar primeiro para capturar o ID
        self.test_get_tema_by_id()
        self.test_get_tema_not_found()
        self.test_create_tema()
        self.test_update_tema()
        self.test_delete_tema()
        
        print("\n" + "="*60)
        print(f"📊 RESUMO: {self.results['passed']} ✅ | {self.results['failed']} ❌")
        print("="*60 + "\n")
        
        return self.results
