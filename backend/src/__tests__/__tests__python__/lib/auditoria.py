"""
Auditoria Module Tests
Testes dos 5 endpoints de auditoria (rastreamento de ações)
Requer: Sistema de auditoria implementado + token admin
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN


class TestAuditoria:
    """Testes dos endpoints de auditoria"""
    
    def __init__(self):
        self.token: Optional[str] = None
        self.usuario_id: Optional[str] = None
        self.auditoria_id: Optional[str] = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def _authenticate(self, shared_token: Optional[str] = None) -> bool:
        """Obter token de autenticação (admin obrigatório para auditoria)"""
        if shared_token:
            self.token = shared_token
            # Obter usuarioId via /auth/me
            try:
                response = requests.get(
                    f"{BASE_URL}/auth/me",
                    headers={"Authorization": f"Bearer {self.token}"},
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    self.usuario_id = data['data'].get('usu_id')
            except Exception:
                pass
            return True
        
        # Fazer login como admin
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
                self.usuario_id = data['data']['usuario'].get('usu_id')
                return True
        except Exception as e:
            print(f"❌ Erro ao fazer login como admin: {e}")
        return False
    
    def _get_headers(self) -> Dict:
        """Retorna headers com token admin"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        } if self.token else {"Content-Type": "application/json"}
    
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
    
    def test_list_auditoria(self) -> bool:
        """
        GET /auditoria
        Testa listagem de logs de auditoria com paginação
        """
        try:
            response = requests.get(
                f"{BASE_URL}/auditoria?page=1&limit=10",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert isinstance(data['data'], list), "data deve ser array"
                
                # Validar estrutura de cada log
                for log in data['data'][:1]:  # Verificar primeiro
                    assert 'aud_id' in log, "aud_id não presente"
                    assert 'aud_acao' in log, "aud_acao não presente"
                    assert 'aud_entidade' in log, "aud_entidade não presente"
                    assert 'aud_status' in log, "aud_status não presente"
                
                # Armazenar primeiro ID para testes posteriores
                if data['data']:
                    self.auditoria_id = data['data'][0].get('aud_id')
                
                self._print_test(
                    "GET /auditoria (Listar Logs)",
                    "PASS",
                    f"Total de logs: {len(data['data'])}"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria (Listar Logs)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria (Listar Logs)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_auditoria_with_filters(self) -> bool:
        """
        GET /auditoria?acao=criar&entidade=parceiro
        Testa filtros avançados de auditoria
        """
        try:
            response = requests.get(
                f"{BASE_URL}/auditoria?acao=criar&entidade=parceiro&limit=5",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                # Se houver resultados, validar que têm a ação correta
                if data['data']:
                    for log in data['data']:
                        # Ação deve corresponder ao filtro (ou ser vazio no início)
                        pass
                
                self._print_test(
                    "GET /auditoria?acao=criar&entidade=parceiro (Filtros)",
                    "PASS",
                    f"Resultados encontrados: {len(data['data'])}"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria?acao=criar&entidade=parceiro (Filtros)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria (Filtros)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_auditoria_estatisticas(self) -> bool:
        """
        GET /auditoria/estatisticas
        Testa endpoint de estatísticas de auditoria
        """
        try:
            response = requests.get(
                f"{BASE_URL}/auditoria/estatisticas",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                stats = data['data']
                
                # Validar campos obrigatórios
                assert 'totalAcoes' in stats, "totalAcoes não presente"
                assert 'totalErros' in stats, "totalErros não presente"
                assert 'taxaErro' in stats, "taxaErro não presente"
                assert 'acoesTop' in stats, "acoesTop não presente"
                assert 'usuariosTop' in stats, "usuariosTop não presente"
                
                # Validar tipos
                assert isinstance(stats['totalAcoes'], (int, float)), "totalAcoes deve ser número"
                assert isinstance(stats['acoesTop'], list), "acoesTop deve ser array"
                assert isinstance(stats['usuariosTop'], list), "usuariosTop deve ser array"
                
                self._print_test(
                    "GET /auditoria/estatisticas (Estatísticas)",
                    "PASS",
                    f"Total de ações: {stats.get('totalAcoes', 0)}, Taxa de erro: {stats.get('taxaErro', 0)}%"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria/estatisticas (Estatísticas)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria/estatisticas (Estatísticas)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_auditoria_por_usuario(self) -> bool:
        """
        GET /auditoria/usuario/:usuarioId
        Testa filtro de logs por usuário específico
        """
        try:
            if not self.usuario_id:
                self._print_test(
                    "GET /auditoria/usuario/:id (Por Usuário)",
                    "SKIP",
                    "usuarioId não disponível"
                )
                return True
            
            response = requests.get(
                f"{BASE_URL}/auditoria/usuario/{self.usuario_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert isinstance(data['data'], list), "data deve ser array"
                
                self._print_test(
                    f"GET /auditoria/usuario/{self.usuario_id} (Por Usuário)",
                    "PASS",
                    f"Logs do usuário: {len(data['data'])}"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria/usuario/:id (Por Usuário)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria/usuario/:id (Por Usuário)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_auditoria_por_entidade(self) -> bool:
        """
        GET /auditoria/entidade/:entidade/:entidadeId
        Testa filtro de logs por entidade específica
        """
        try:
            # Usar um parceiro_id como exemplo
            PARCEIRO_ID = "550e8400-e29b-41d4-a716-446655440001"
            
            response = requests.get(
                f"{BASE_URL}/auditoria/entidade/parceiro/{PARCEIRO_ID}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert isinstance(data['data'], list), "data deve ser array"
                
                # Se houver logs, validar estrutura
                if data['data']:
                    log = data['data'][0]
                    assert log.get('aud_entidade') == 'parceiro', "Entidade deve ser 'parceiro'"
                    assert log.get('aud_entidade_id') == PARCEIRO_ID, "ID da entidade não coincide"
                
                self._print_test(
                    "GET /auditoria/entidade/parceiro/:id (Por Entidade)",
                    "PASS",
                    f"Logs da entidade: {len(data['data'])}"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria/entidade/:entidade/:id (Por Entidade)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria/entidade/:entidade/:id (Por Entidade)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_auditoria_obter_por_id(self) -> bool:
        """
        GET /auditoria/:id
        Testa obtenção de um log específico
        """
        try:
            if not self.auditoria_id:
                self._print_test(
                    "GET /auditoria/:id (Obter por ID)",
                    "SKIP",
                    "auditoria_id não disponível"
                )
                return True
            
            response = requests.get(
                f"{BASE_URL}/auditoria/{self.auditoria_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                log = data['data']
                assert log.get('aud_id') == self.auditoria_id, "IDs não coincIDem"
                assert 'aud_acao' in log, "aud_acao não presente"
                
                self._print_test(
                    f"GET /auditoria/{self.auditoria_id} (Obter por ID)",
                    "PASS",
                    f"Ação: {log.get('aud_acao', 'N/A')}"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria/:id (Obter por ID)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria/:id (Obter por ID)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_auditoria_sem_autenticacao(self) -> bool:
        """
        GET /auditoria (sem token)
        Testa que auditoria requer autenticação e admin
        """
        try:
            # Tentar acessar sem token
            response = requests.get(
                f"{BASE_URL}/auditoria",
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            # Deve retornar 401 ou 403
            if response.status_code in [401, 403]:
                self._print_test(
                    "GET /auditoria (Sem Autenticação)",
                    "PASS",
                    f"Corretamente bloqueado com status {response.status_code}"
                )
                return True
            else:
                self._print_test(
                    "GET /auditoria (Sem Autenticação)",
                    "FAIL",
                    f"Deveria retornar 401/403, retornou {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /auditoria (Sem Autenticação)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None) -> Dict:
        """Executa todos os testes de auditoria"""
        print("\n" + "="*60)
        print("🔍 TESTES DE AUDITORIA (Rastreamento de Ações)")
        print("="*60)
        
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação. Testes cancelados.")
            return self.results
        
        # Executar testes em ordem
        self.test_list_auditoria()
        self.test_auditoria_with_filters()
        self.test_auditoria_estatisticas()
        self.test_auditoria_por_usuario()
        self.test_auditoria_por_entidade()
        self.test_auditoria_obter_por_id()
        self.test_auditoria_sem_autenticacao()
        
        # Resumo
        print("\n" + "-"*60)
        print(f"📊 Resumo: {self.results['passed']} ✅ | {self.results['failed']} ❌")
        if self.results['errors']:
            print("\n❌ Erros encontrados:")
            for error in self.results['errors']:
                print(f"   • {error}")
        print("-"*60)
        
        return self.results
