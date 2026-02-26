"""
Auth Module Tests
Testes reais dos 7 endpoints de autenticação
"""

import requests
import json
from typing import Dict, Tuple, Optional
from config import BASE_URL, TEST_ADMIN, TEST_USER


class TestAuth:
    """Testes dos endpoints de autenticação"""
    
    # Credenciais de teste
    TEST_USER_EMAIL = TEST_USER['email']
    TEST_USER_PASSWORD = TEST_USER['password']
    TEST_USER_NEW_PASSWORD = "novaTeste123"
    
    def __init__(self):
        self.token: Optional[str] = None
        self.user_data: Optional[Dict] = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
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
    
    def test_login_success(self) -> bool:
        """
        POST /auth/login
        Testa login com credenciais válidas
        """
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": self.TEST_USER_EMAIL,
                    "senha": self.TEST_USER_PASSWORD
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'token' in data['data'], "token não presente"
                assert 'usuario' in data['data'], "usuario não presente"
                
                # Armazenar token para próximos testes
                self.token = data['data']['token']
                self.user_data = data['data']['usuario']
                
                self._print_test(
                    "POST /auth/login (Credenciais Válidas)",
                    "PASS",
                    f"Token gerado: {self.token[:20]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /auth/login (Credenciais Válidas)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/login (Credenciais Válidas)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_login_invalid_credentials(self) -> bool:
        """
        POST /auth/login
        Testa login com credenciais inválidas
        """
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": self.TEST_USER_EMAIL,
                    "senha": "senhaErrada123"
                },
                timeout=5
            )
            
            if response.status_code == 401:
                data = response.json()
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "POST /auth/login (Credenciais Inválidas)",
                    "PASS",
                    "Rejeitou senha incorreta"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/login (Credenciais Inválidas)",
                    "FAIL",
                    f"Status esperado 401, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/login (Credenciais Inválidas)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_login_missing_fields(self) -> bool:
        """
        POST /auth/login
        Testa login sem email/senha
        """
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": self.TEST_USER_EMAIL},  # Sem senha
                timeout=5
            )
            
            if response.status_code == 400:
                data = response.json()
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "POST /auth/login (Campos Obrigatórios)",
                    "PASS",
                    "Validação de campos funcionando"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/login (Campos Obrigatórios)",
                    "FAIL",
                    f"Status esperado 400, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/login (Campos Obrigatórios)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_verify_token_valid(self) -> bool:
        """
        POST /auth/verify
        Testa verificação de token válido
        """
        if not self.token:
            # Fazer login primeiro
            self.test_login_success()
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/verify",
                json={"token": self.token},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                self._print_test(
                    "POST /auth/verify (Token Válido)",
                    "PASS",
                    "Token verificado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/verify (Token Válido)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/verify (Token Válido)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_verify_token_invalid(self) -> bool:
        """
        POST /auth/verify
        Testa verificação de token inválido
        """
        try:
            response = requests.post(
                f"{BASE_URL}/auth/verify",
                json={"token": "tokenInvalidoABC123xyz"},
                timeout=5
            )
            
            if response.status_code == 401:
                data = response.json()
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "POST /auth/verify (Token Inválido)",
                    "PASS",
                    "Rejeitou token inválido"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/verify (Token Inválido)",
                    "FAIL",
                    f"Status esperado 401, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/verify (Token Inválido)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_current_user(self) -> bool:
        """
        GET /auth/me
        Testa obtenção dos dados do usuário autenticado
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.get(
                f"{BASE_URL}/auth/me",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'usu_email' in data['data'], "usu_email não presente"
                
                self._print_test(
                    "GET /auth/me (Usuário Autenticado)",
                    "PASS",
                    f"Usuário: {data['data'].get('usu_email')}"
                )
                return True
            else:
                self._print_test(
                    "GET /auth/me (Usuário Autenticado)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auth/me (Usuário Autenticado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_current_user_without_auth(self) -> bool:
        """
        GET /auth/me
        Testa acesso sem token
        """
        try:
            response = requests.get(
                f"{BASE_URL}/auth/me",
                timeout=5
            )
            
            if response.status_code == 401:
                data = response.json()
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "GET /auth/me (Sem Autenticação)",
                    "PASS",
                    "Rejeitou acesso sem token"
                )
                return True
            else:
                self._print_test(
                    "GET /auth/me (Sem Autenticação)",
                    "FAIL",
                    f"Status esperado 401, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auth/me (Sem Autenticação)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_permissions(self) -> bool:
        """
        GET /auth/me/permissoes
        Testa obtenção de permissões do usuário
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.get(
                f"{BASE_URL}/auth/me/permissoes",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert isinstance(data['data'], list), "data deve ser array"
                
                self._print_test(
                    "GET /auth/me/permissoes (Permissões)",
                    "PASS",
                    f"Total de permissões: {len(data['data'])}"
                )
                return True
            else:
                self._print_test(
                    "GET /auth/me/permissoes (Permissões)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auth/me/permissoes (Permissões)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_refresh_token(self) -> bool:
        """
        POST /auth/refresh
        Testa renovação do token
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/refresh",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert 'token' in data['data'], "novo token não presente"
                
                # Atualizar token
                new_token = data['data']['token']
                old_token = self.token
                self.token = new_token
                
                self._print_test(
                    "POST /auth/refresh (Renovar Token)",
                    "PASS",
                    f"Token renovado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/refresh (Renovar Token)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/refresh (Renovar Token)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_logout(self) -> bool:
        """
        POST /auth/logout
        Testa logout do usuário
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/logout",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data.get('success') == True, "success deve ser true"
                
                self._print_test(
                    "POST /auth/logout (Logout)",
                    "PASS",
                    "Logout realizado com sucesso"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/logout (Logout)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/logout (Logout)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_change_password_success(self) -> bool:
        """
        POST /auth/change-password
        Testa alteração de senha com valores válidos
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/change-password",
                headers={"Authorization": f"Bearer {self.token}"},
                json={
                    "senhaAtual": self.TEST_USER_PASSWORD,
                    "senhaNova": self.TEST_USER_NEW_PASSWORD,
                    "senhaConfirm": self.TEST_USER_NEW_PASSWORD
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data.get('success') == True, "success deve ser true"
                
                self._print_test(
                    "POST /auth/change-password (Sucesso)",
                    "PASS",
                    "Senha alterada com sucesso"
                )
                
                # Atualizar credenciais para próximos testes
                self.TEST_USER_PASSWORD = self.TEST_USER_NEW_PASSWORD
                return True
            else:
                self._print_test(
                    "POST /auth/change-password (Sucesso)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/change-password (Sucesso)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_change_password_mismatch(self) -> bool:
        """
        POST /auth/change-password
        Testa alteração com senhas diferentes
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/change-password",
                headers={"Authorization": f"Bearer {self.token}"},
                json={
                    "senhaAtual": self.TEST_USER_PASSWORD,
                    "senhaNova": "senhaNovaOK123",
                    "senhaConfirm": "senhaNovaERRADA456"  # Diferentes
                },
                timeout=5
            )
            
            if response.status_code == 400:
                data = response.json()
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "POST /auth/change-password (Senhas Incompatíveis)",
                    "PASS",
                    "Rejeitou senhas diferentes"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/change-password (Senhas Incompatíveis)",
                    "FAIL",
                    f"Status esperado 400, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/change-password (Senhas Incompatíveis)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_change_password_short(self) -> bool:
        """
        POST /auth/change-password
        Testa alteração com senha muito curta
        """
        if not self.token:
            self.test_login_success()
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/change-password",
                headers={"Authorization": f"Bearer {self.token}"},
                json={
                    "senhaAtual": self.TEST_USER_PASSWORD,
                    "senhaNova": "123",  # Menos de 6 caracteres
                    "senhaConfirm": "123"
                },
                timeout=5
            )
            
            if response.status_code == 400:
                data = response.json()
                assert data.get('success') == False, "success deve ser false"
                
                self._print_test(
                    "POST /auth/change-password (Senha Curta)",
                    "PASS",
                    "Rejeitou senha com menos de 6 caracteres"
                )
                return True
            else:
                self._print_test(
                    "POST /auth/change-password (Senha Curta)",
                    "FAIL",
                    f"Status esperado 400, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /auth/change-password (Senha Curta)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self):
        """Executa todos os testes de auth"""
        print("\n" + "="*60)
        print("🔐 TESTES DE AUTENTICAÇÃO (AUTH)")
        print("="*60 + "\n")
        
        # PRIMEIRO: Fazer login bem-sucedido para obter token
        self.test_login_success()
        
        # Testes que usam token válido
        self.test_verify_token_valid()
        self.test_get_current_user()
        self.test_get_permissions()
        self.test_refresh_token()
        self.test_change_password_success()
        
        # Testes de erro/validação (podem bloquear conta, então vêm depois)
        self.test_login_invalid_credentials()
        self.test_login_missing_fields()
        self.test_verify_token_invalid()
        self.test_get_current_user_without_auth()
        self.test_logout()
        self.test_change_password_mismatch()
        self.test_change_password_short()
        
        # Resumo
        print("\n" + "="*60)
        print(f"📊 RESUMO: {self.results['passed']} ✅ | {self.results['failed']} ❌")
        print("="*60)
        
        if self.results['failed'] > 0:
            print("\n⚠️  ERROS ENCONTRADOS:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        return self.results
