# -*- coding: utf-8 -*-
"""
Componente-Elemento Relação Tests
Testes para relação muitos-para-muitos entre componentes e elementos
"""

import requests
import json
from typing import Dict, Optional
from config import BASE_URL, TEST_ADMIN, TEST_TEMA_ID


class TestComEleRel:
    """
    Classe para testes de integração de Componente-Elemento Relação
    Testa operações CRUD para relações entre componentes e elementos
    """
    
    ADMIN_EMAIL = "admin@siteoni.com.br"
    ADMIN_PASSWORD = "admin123"
    
    # IDs capturados para uso nos testes
    componente_id = None
    elemento_id = None
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
            return True
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
                return False
                
        except Exception as e:
            print(f"⚠️  Erro de autenticação: {str(e)}")
            return False
        
        return True
    
    def _get_headers(self):
        """Retorna headers com token de autenticação"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def _get_first_componente_e_elemento(self):
        """Obtém o primeiro registro de componente e elemento para usar nos testes"""
        try:
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
            
            # Obter primeiro elemento
            response_elemento = requests.get(
                f"{BASE_URL}/elementos",
                headers=self._get_headers(),
                timeout=5
            )
            if response_elemento.status_code == 200:
                elementos = response_elemento.json().get('data', [])
                if elementos:
                    self.elemento_id = elementos[0].get('ele_id')
                    
        except Exception as e:
            print(f"⚠️  Erro ao obter componente/elemento: {str(e)}")
    
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
        GET /com-ele-rels
        Testa listagem de todas as relações componente-elemento
        """
        try:
            response = requests.get(
                f"{BASE_URL}/com-ele-rels",
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
                    "GET /com-ele-rels (Listar)",
                    "PASS",
                    f"Total de relações: {relacoes_count}"
                )
                return True
            else:
                self._print_test(
                    "GET /com-ele-rels (Listar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /com-ele-rels (Listar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_relacao_by_id(self) -> bool:
        """
        GET /com-ele-rels/:id
        Testa busca de relação por ID (usa primeira relação da lista)
        """
        try:
            # Primeiro listar para obter um ID válido
            response_list = requests.get(
                f"{BASE_URL}/com-ele-rels",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response_list.status_code != 200:
                self._print_test(
                    "GET /com-ele-rels/:id (Obter)",
                    "SKIP",
                    "Não foi possível listar relações"
                )
                return False
            
            relacoes = response_list.json().get('data', [])
            if not relacoes:
                self._print_test(
                    "GET /com-ele-rels/:id (Obter)",
                    "SKIP",
                    "Nenhuma relação disponível para teste"
                )
                return False
            
            relacao_id = relacoes[0].get('cer_id')
            
            response = requests.get(
                f"{BASE_URL}/com-ele-rels/{relacao_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                
                self._print_test(
                    "GET /com-ele-rels/:id (Obter)",
                    "PASS",
                    f"Relação encontrada"
                )
                return True
            else:
                self._print_test(
                    "GET /com-ele-rels/:id (Obter)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /com-ele-rels/:id (Obter)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_get_relacao_not_found(self) -> bool:
        """
        GET /com-ele-rels/:id
        Testa 404 para relação inexistente
        """
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            response = requests.get(
                f"{BASE_URL}/com-ele-rels/{fake_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 404:
                self._print_test(
                    "GET /com-ele-rels/:id (Não Encontrado)",
                    "PASS",
                    "Retornou 404 para relação inexistente"
                )
                return True
            else:
                self._print_test(
                    "GET /com-ele-rels/:id (Não Encontrado)",
                    "FAIL",
                    f"Status esperado 404, recebido {response.status_code}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "GET /com-ele-rels/:id (Não Encontrado)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_create_relacao(self) -> bool:
        """
        POST /com-ele-rels
        Testa criação de nova relação componente-elemento
        Cria um novo componente e elemento para evitar conflitos com seeds
        """
        try:
            import uuid
            unique_id = str(uuid.uuid4())[:8]
            
            # Criar um novo componente para o teste (com campos corretos)
            componente_data = {
                "com_nome": f"componente-teste-cer-{unique_id}",
                "com_descricao": "Componente criado para teste de relação",
                "com_tipo": "global",
                "com_possui_elementos": True
            }
            
            componente_response = requests.post(
                f"{BASE_URL}/componentes",
                json=componente_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if componente_response.status_code != 201:
                self._print_test(
                    "POST /com-ele-rels (Criar)",
                    "SKIP",
                    f"Não foi possível criar componente: {componente_response.status_code}"
                )
                return False
            
            test_componente_id = componente_response.json().get('data', {}).get('com_id')
            
            # Criar um novo elemento para o teste (com campos corretos)
            elemento_data = {
                "ele_nome": f"elemento-teste-cer-{unique_id}",
                "ele_descricao": "Elemento criado para teste de relação",
                "ele_obrigatório": False
            }
            
            elemento_response = requests.post(
                f"{BASE_URL}/elementos",
                json=elemento_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if elemento_response.status_code != 201:
                self._print_test(
                    "POST /com-ele-rels (Criar)",
                    "SKIP",
                    f"Não foi possível criar elemento: {elemento_response.status_code}"
                )
                return False
            
            test_elemento_id = elemento_response.json().get('data', {}).get('ele_id')
            
            # Criar a relação
            relacao_data = {
                "cer_com_id": test_componente_id,
                "cer_ele_id": test_elemento_id,
                "cer_ordem": 1,
                "cer_habilitado": True
            }
            
            response = requests.post(
                f"{BASE_URL}/com-ele-rels",
                json=relacao_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code == 201:
                data = response.json()
                
                # Validar resposta
                assert data.get('success') == True, "success deve ser true"
                assert 'data' in data, "data não presente"
                assert data['data'].get('cer_id'), "ID não retornado"
                
                self.relacao_id = data['data'].get('cer_id')
                
                self._print_test(
                    "POST /com-ele-rels (Criar)",
                    "PASS",
                    f"Relação criada com ID: {self.relacao_id[:8]}..."
                )
                return True
            else:
                self._print_test(
                    "POST /com-ele-rels (Criar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "POST /com-ele-rels (Criar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_update_relacao(self) -> bool:
        """
        PUT /com-ele-rels/:id
        Testa atualização de relação
        """
        try:
            if not self.relacao_id:
                self._print_test(
                    "PUT /com-ele-rels/:id (Atualizar)",
                    "SKIP",
                    "Relação não foi criada"
                )
                return False
            
            update_data = {
                "cer_ordem": 2,
                "cer_habilitado": False
            }
            
            response = requests.put(
                f"{BASE_URL}/com-ele-rels/{self.relacao_id}",
                json=update_data,
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code in [200, 204]:
                self._print_test(
                    "PUT /com-ele-rels/:id (Atualizar)",
                    "PASS",
                    "Relação atualizada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "PUT /com-ele-rels/:id (Atualizar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "PUT /com-ele-rels/:id (Atualizar)",
                "FAIL",
                str(e)
            )
            return False
    
    def test_delete_relacao(self) -> bool:
        """
        DELETE /com-ele-rels/:id
        Testa deleção de relação
        """
        try:
            if not self.relacao_id:
                self._print_test(
                    "DELETE /com-ele-rels/:id (Deletar)",
                    "SKIP",
                    "Relação não foi criada"
                )
                return False
            
            response = requests.delete(
                f"{BASE_URL}/com-ele-rels/{self.relacao_id}",
                headers=self._get_headers(),
                timeout=5
            )
            
            if response.status_code in [200, 204]:
                self._print_test(
                    "DELETE /com-ele-rels/:id (Deletar)",
                    "PASS",
                    "Relação deletada com sucesso"
                )
                return True
            else:
                self._print_test(
                    "DELETE /com-ele-rels/:id (Deletar)",
                    "FAIL",
                    f"Status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self._print_test(
                "DELETE /com-ele-rels/:id (Deletar)",
                "FAIL",
                str(e)
            )
            return False
    
    def run_all_tests(self, shared_token: Optional[str] = None):
        if not self._authenticate(shared_token):
            print("❌ Falha na autenticação")
            return self.results
        
        """Executa todos os testes de relação componente-elemento"""
        print("\n" + "="*60)
        print("🎨 TESTES DE COM-ELE-REL (COM-ELE-REL)")
        print("="*60 + "\n")
        self.test_list_relacoes()
        self.test_get_relacao_by_id()
        self.test_get_relacao_not_found()
        self.test_create_relacao()
        self.test_update_relacao()
        self.test_delete_relacao()
