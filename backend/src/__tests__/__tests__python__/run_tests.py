# -*- coding: utf-8 -*-
"""
Test Orchestrator
Coordena execução de testes de diferentes módulos
"""

import sys
import os
import io
import time
import requests

# Configurar encoding UTF-8 para saída
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')
    # Force UTF-8 output
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    else:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from config import BASE_URL, TEST_ADMIN
from lib.auth import TestAuth
from lib.parceiro import TestParceiro
from lib.tema import TestTema
from lib.pagina import TestPagina
from lib.componente import TestComponente
from lib.elemento import TestElemento
from lib.pag_com_rel import TestPagComRel
from lib.com_ele_rel import TestComEleRel
from lib.cores import TestCores
from lib.imagens import TestImagens
from lib.links import TestLinks
from lib.textos import TestTextos
from lib.conteudo import TestConteudo
from lib.features import TestFeatures
from lib.config_tema import TestConfigTema


class TestOrchestrator:
    """Coordena execução de testes"""
    
    def __init__(self):
        self.results = {
            'total_passed': 0,
            'total_failed': 0,
            'modules': {}
        }
        self.shared_token = None
        self.admin_token = None
        self._get_admin_token()
    
    def _get_admin_token(self):
        """Obter token admin uma única vez para reutilizar em todos os módulos"""
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
                self.admin_token = data['data']['token']
                return self.admin_token
        except Exception as e:
            print(f"❌ Erro ao obter token admin: {e}")
        return None
    
    def run_all_modules(self):
        """Executar testes de todos os módulos"""
        
        print("\n" + "="*70)
        print("🚀 INICIANDO FRAMEWORK DE TESTES DE INTEGRAÇÃO")
        print("="*70)
        print("Base URL: http://localhost:3000/api/v1")
        print("⚠️  Certifique-se que o backend está rodando!")
        print("="*70 + "\n")
        
        # Testes de Autenticação (para obter token compartilhado)
        print("\n🔐 Executando testes de AUTENTICAÇÃO...\n")
        auth_tester = TestAuth()
        auth_tester.run_all_tests()
        self.results['modules']['AUTH'] = auth_tester.results
        self.results['total_passed'] += auth_tester.results['passed']
        self.results['total_failed'] += auth_tester.results['failed']
        
        # Obter token do auth_tester e compartilhar com outros módulos
        self.shared_token = auth_tester.token
        
        # Testes de Parceiro
        print("\n🏢 Executando testes de PARCEIRO...\n")
        parceiro_tester = TestParceiro()
        parceiro_tester.run_all_tests(self.admin_token)
        self.results['modules']['PARCEIRO'] = parceiro_tester.results
        self.results['total_passed'] += parceiro_tester.results['passed']
        self.results['total_failed'] += parceiro_tester.results['failed']
        
        # Testes de Tema
        print("\n🎨 Executando testes de TEMA...\n")
        tema_tester = TestTema()
        tema_tester.run_all_tests(self.admin_token)
        self.results['modules']['TEMA'] = tema_tester.results
        self.results['total_passed'] += tema_tester.results['passed']
        self.results['total_failed'] += tema_tester.results['failed']
        
        # Testes de Página
        print("\n📄 Executando testes de PÁGINA...\n")
        pagina_tester = TestPagina()
        pagina_tester.run_all_tests(self.admin_token)
        self.results['modules']['PÁGINA'] = pagina_tester.results
        self.results['total_passed'] += pagina_tester.results['passed']
        self.results['total_failed'] += pagina_tester.results['failed']
        
        # Testes de Componente
        print("\n🧩 Executando testes de COMPONENTE...\n")
        componente_tester = TestComponente()
        componente_tester.run_all_tests(self.admin_token)
        self.results['modules']['COMPONENTE'] = componente_tester.results
        self.results['total_passed'] += componente_tester.results['passed']
        self.results['total_failed'] += componente_tester.results['failed']
        
        # Testes de Elemento
        print("\n⚙️  Executando testes de ELEMENTO...\n")
        elemento_tester = TestElemento()
        elemento_tester.run_all_tests(self.admin_token)
        self.results['modules']['ELEMENTO'] = elemento_tester.results
        self.results['total_passed'] += elemento_tester.results['passed']
        self.results['total_failed'] += elemento_tester.results['failed']
        
        # Testes de Página-Componente Relação
        print("\n🔗 Executando testes de PÁG-COM-REL...\n")
        pag_com_rel_tester = TestPagComRel()
        pag_com_rel_tester.run_all_tests(self.admin_token)
        self.results['modules']['PÁG-COM-REL'] = pag_com_rel_tester.results
        self.results['total_passed'] += pag_com_rel_tester.results['passed']
        self.results['total_failed'] += pag_com_rel_tester.results['failed']
        
        # Testes de Componente-Elemento Relação
        print("\n🔗 Executando testes de COM-ELE-REL...\n")
        com_ele_rel_tester = TestComEleRel()
        com_ele_rel_tester.run_all_tests(self.admin_token)
        self.results['modules']['COM-ELE-REL'] = com_ele_rel_tester.results
        self.results['total_passed'] += com_ele_rel_tester.results['passed']
        self.results['total_failed'] += com_ele_rel_tester.results['failed']
        
        # Testes de Cores
        print("\n🎨 Executando testes de CORES...\n")
        cores_tester = TestCores()
        cores_tester.run_all_tests(self.admin_token)
        self.results['modules']['CORES'] = cores_tester.results
        self.results['total_passed'] += cores_tester.results['passed']
        self.results['total_failed'] += cores_tester.results['failed']
        
        time.sleep(3)
        
        # Testes de Imagens
        print("\n🖼️  Executando testes de IMAGENS...\n")
        imagens_tester = TestImagens()
        imagens_tester.run_all_tests(self.admin_token)
        self.results['modules']['IMAGENS'] = imagens_tester.results
        self.results['total_passed'] += imagens_tester.results['passed']
        self.results['total_failed'] += imagens_tester.results['failed']
        
        time.sleep(3)
        
        # Testes de Links
        print("\n🔗 Executando testes de LINKS...\n")
        links_tester = TestLinks()
        links_tester.run_all_tests(self.admin_token)
        self.results['modules']['LINKS'] = links_tester.results
        self.results['total_passed'] += links_tester.results['passed']
        self.results['total_failed'] += links_tester.results['failed']
        
        # Delay para evitar rate limiting
        time.sleep(15)
        
        # Testes de Textos
        print("\n📝 Executando testes de TEXTOS...\n")
        textos_tester = TestTextos()
        textos_tester.run_all_tests(self.admin_token)
        self.results['modules']['TEXTOS'] = textos_tester.results
        self.results['total_passed'] += textos_tester.results['passed']
        self.results['total_failed'] += textos_tester.results['failed']
        
        time.sleep(3)
        
        # Testes de Conteúdo
        print("\n📄 Executando testes de CONTEÚDO...\n")
        conteudo_tester = TestConteudo()
        conteudo_tester.run_all_tests(self.admin_token)
        self.results['modules']['CONTEÚDO'] = conteudo_tester.results
        self.results['total_passed'] += conteudo_tester.results['passed']
        self.results['total_failed'] += conteudo_tester.results['failed']
        
        time.sleep(3)
        
        # Testes de Features
        print("\n⭐ Executando testes de FEATURES...\n")
        features_tester = TestFeatures()
        features_tester.run_all_tests(self.admin_token)
        self.results['modules']['FEATURES'] = features_tester.results
        self.results['total_passed'] += features_tester.results['passed']
        self.results['total_failed'] += features_tester.results['failed']
        
        time.sleep(3)
        
        # Testes de Configuração de Tema
        print("\n⚙️  Executando testes de CONFIG-TEMA...\n")
        config_tema_tester = TestConfigTema()
        config_tema_tester.run_all_tests(self.admin_token)
        self.results['modules']['CONFIG-TEMA'] = config_tema_tester.results
        self.results['total_passed'] += config_tema_tester.results['passed']
        self.results['total_failed'] += config_tema_tester.results['failed']
        
        # Relatório final
        self.print_final_report()
    
    def print_final_report(self):
        """Exibir relatório final de todos os testes"""
        
        total_tests = self.results['total_passed'] + self.results['total_failed']
        success_rate = (self.results['total_passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "="*70)
        print("📋 RELATÓRIO FINAL - TESTES DE INTEGRAÇÃO")
        print("="*70 + "\n")
        
        print(f"✅ Total de SUCESSOS: {self.results['total_passed']}")
        print(f"❌ Total de FALHAS:   {self.results['total_failed']}")
        print(f"📊 Taxa de Sucesso:   {success_rate:.1f}%")
        print("\n" + "="*70)
        
        if self.results['total_failed'] == 0:
            print("✨ TODOS OS TESTES PASSARAM COM SUCESSO!")
        else:
            print("\n⚠️  MÓDULOS COM FALHAS:\n")
            for modulo, resultado in self.results['modules'].items():
                if resultado['failed'] > 0:
                    print(f"  📌 {modulo}:")
                    for erro in resultado['errors']:
                        print(f"     • {erro}")
        
        print("\n" + "="*70 + "\n")
        
        return self.results['total_failed'] == 0


def main():
    """Ponto de entrada"""
    orchestrator = TestOrchestrator()
    orchestrator.run_all_modules()


if __name__ == "__main__":
    main()
