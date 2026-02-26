# -*- coding: utf-8 -*-
"""
Página-Componente Relação Tests
Testes para relação muitos-para-muitos entre páginas e componentes
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN, TEST_TEMA_ID


class TestPagComRel:
    """
    Classe para testes de integração de Página-Componente Relação
    Testa operações CRUD para relações entre páginas e componentes
    """
    
    ADMIN_EMAIL = "admin@siteoni.com.br"
    ADMIN_PASSWORD = "admin123"
    
    # IDs capturados para uso nos testes
    pagina_id = None
    componente_id = None
    relacao_id = None
    
    # Token de autenticação
    token = None
    
    def __init__(self):
        """Inicializa o testador"""
        self.results = {'passed': 0, 'failed': 0, 'errors': []}
        self.token = None
    
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
    
    def _get_first_pagina_e_componente(self):
        """Obtém o primeiro registro de página e componente para usar nos testes"""
        try:
            # Obter primeira página
            response_pagina = requests.get(
                f"{BASE_URL}/paginas",
                headers=self._get_headers(),
                timeout=5
            )
            if response_pagina.status_code == 200:
                paginas = response_pagina.json().get('data', [])
                if paginas:
                    self.pagina_id = paginas[0].get('pag_id')
            
            # Obter primeiro componente
            response_componente = requests.get(
                f"{BASE_URL}/componentes",
                headers=self._get_headers(),
                timeout=5
            )
            if response_componente.status_code == 200:
                componentes = response_componente.json().get('data', [])
                if componentes:
                    self.componente_id = componentes[0].get('com_id')
                    
        except Exception as e:
            print(f"⚠️  Erro ao obter página/componente: {str(e)}")
    
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
    
    def test_list_relacoes(self) -> bool:
        """
        GET /pag-com-rels
        Testa listagem de todas as relações página-componente
        """
        try:
            response = requests.get(
                f"{BASE_URL}/pag-com-rels",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                relacoes_list = data['data'] if isinstance(data['data'], list) else []
                relacoes_count = len(relacoes_list)
                
                self._print_test(
                    "GET /pag-com-rels (Listar)",
                    "PASS",
                    f"Total de relações: {relacoes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /pag-com-rels (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /pag-com-rels (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_relacao_by_id(self) -> bool:
        """
        GET /pag-com-rels/:id
        Testa busca de relação por ID (usa primeira relação da lista)
        """
        try:
            # Primeiro listar para obter um ID válido
            response_list = requests.get(
                f"{BASE_URL}/pag-com-rels",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response_list.status_code != 200:
                self._print_test(
                    "GET /pag-com-rels/:id (Obter)",
                    "SKIP",
                    "Não foi possível listar relações"
                )
                return False
            
            relacoes = response_list.json().get('data', [])
            if not relacoes:
                self._print_test(
                    "GET /pag-com-rels/:id (Obter)",
                    "SKIP",
                    "Nenhuma relação disponível para teste"
                )
                return False
            
            relacao_id = relacoes[0].get('pcr_id')
            
            response = requests.get(
                f"{BASE_URL}/pag-com-rels/{relacao_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                self._print_test(
                    "GET /pag-com-rels/:id (Obter)",
                    "PASS",
                    f"Relação encontrada"
                )
                return True
            else:
                self._print_test(
                    "GET /pag-com-rels/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /pag-com-rels/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_relacao_not_found(self) -> bool:
        """
        GET /pag-com-rels/:id
        Testa 404 para relação inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            response = requests.get(
                f"{BASE_URL}/pag-com-rels/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /pag-com-rels/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para relação inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /pag-com-rels/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /pag-com-rels/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_relacao(self) -> bool:
        """
        POST /pag-com-rels
        Testa criação de nova relação página-componente
        Usa última página e último componente para evitar conflitos
        """
        try:
            # Obter último componente
            componentes_response = requests.get(
                f"{BASE_URL}/componentes",
                headers=self._get_headers(),
                timeout=5
            )
            
            if componentes_response.status_code != 200:
                self._print_test(
                    "POST /pag-com-rels (Criar)",
                    "SKIP",
                    f"Não foi possível listar componentes: {componentes_response.status_code}"
                )
                return False
            
            componentes = componentes_response.json().get('data', [])
            
            if len(componentes) < 1:
                self._print_test(
                    "POST /pag-com-rels (Criar)",
                    "SKIP",
                    "Nenhum componente disponível para teste"
                )
                return False
            
            # Usar último componente (índice -1)
            test_componente_id = componentes[-1].get('com_id')
            
            # Obter última página
            paginas_response = requests.get(
                f"{BASE_URL}/paginas",
                headers=self._get_headers(),
                timeout=5
            )
            
            if paginas_response.status_code != 200:
                self._print_test(
                    "POST /pag-com-rels (Criar)",
                    "SKIP",
                    f"Não foi possível listar páginas: {paginas_response.status_code}"
                )
                return False
            
            paginas = paginas_response.json().get('data', [])
            
            if len(paginas) < 1:
                self._print_test(
                    "POST /pag-com-rels (Criar)",
                    "SKIP",
                    "Nenhuma página disponível para teste"
                )
                return False
            
            # Usar última página (índice -1)
            test_pagina_id = paginas[-1].get('pag_id')
            
            relacao_data = {
                "pcr_pag_id": test_pagina_id,
                "pcr_com_id": test_componente_id,
                "pcr_ordem": 1,
                "pcr_habilitado": True
            }
            
            response = requests.post(
                f"{BASE_URL}/pag-com-rels",
                json=relacao_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('pcr_id'), "ID não retornado"
                
                self.relacao_id = data['data'].get('pcr_id')
                
                self._print_test(
                    "POST /pag-com-rels (Criar)",
                    "PASS",
                    f"Relação criada com ID: {self.relacao_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /pag-com-rels (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /pag-com-rels (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_relacao(self) -> bool:
        """
        PUT /pag-com-rels/:id
        Testa atualização de relação
        """
        try:
            if not self.relacao_id:
                self._print_test(
                    "PUT /pag-com-rels/:id (Atualizar)",
                    "SKIP",
                    "Relação não foi criada"
                )
                return False
            
            update_data = {
                "pcr_ordem": 2,
                "pcr_habilitado": False
            }
            
            response = requests.put(
                f"{BASE_URL}/pag-com-rels/{self.relacao_id}",
                json=update_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert data['data'].get('pcr_ordem') == 2, "Ordem não foi atualizada"
                
                self._print_test(
                    "PUT /pag-com-rels/:id (Atualizar)",
                    "PASS",
                    "Relação atualizada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /pag-com-rels/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /pag-com-rels/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_relacao(self) -> bool:
        """
        DELETE /pag-com-rels/:id
        Testa deleção de relação
        """
        try:
            if not self.relacao_id:
                self._print_test(
                    "DELETE /pag-com-rels/:id (Deletar)",
                    "SKIP",
                    "Relação não foi criada"
                )
                return False
            
            response = requests.delete(
                f"{BASE_URL}/pag-com-rels/{self.relacao_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code in [200, 204]:
                self._print_test(
                    "DELETE /pag-com-rels/:id (Deletar)",
                    "PASS",
                    "Relação deletada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /pag-com-rels/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /pag-com-rels/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None) -> dict:
        """
        Executa todos os testes de relação página-componente
        
        Args:
            shared_token: Token de autenticação compartilhado (opcional)
        
        Returns:
            Dicionário com resultados (passed, failed, errors)
        """
        self._authenticate(shared_token)
        
        print("\n🔗 Executando testes de PÁGINA-COMPONENTE...")
        
        # Executar testes em ordem
        self.test_list_relacoes()
        self.test_get_relacao_by_id()
        self.test_get_relacao_not_found()
        self.test_create_relacao()
        self.test_update_relacao()
        self.test_delete_relacao()
        
        return self.results
