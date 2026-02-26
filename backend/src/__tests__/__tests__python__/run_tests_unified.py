#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Orchestrator - Versão Unificada
Executa todos os testes com padrão otimizado (Shared Token)
"""

import sys
import os
import io
import time
import requests

# Configurar encoding UTF-8 para saída
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')
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


class TestOrchestratorUnified:
    """Coordena execução unificada de testes com shared token"""
    
    def __init__(self):
        self.results = {
            'total_passed': 0,
            'total_failed': 0,
            'modules': {}
        }
        self.admin_token = None
        self._get_admin_token()
    
    def _get_admin_token(self):
        """Obter token admin uma única vez para reutilizar"""
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
                self.admin_token = response.json()['data']['token']
                return self.admin_token
        except Exception as e:
            print(f"❌ Erro ao obter token: {e}")
        return None
    
    def _run_module(self, module_class, module_name, emoji, use_admin_token=False):
        """Executar testes de um módulo"""
        print(f"\n{emoji} Executando testes de {module_name}...\n")
        
        try:
            tester = module_class()
            
            # Módulos que suportam shared_token
            if use_admin_token and hasattr(tester, 'run_all_tests'):
                tester.run_all_tests(self.admin_token)
            else:
                tester.run_all_tests()
            
            self.results['modules'][module_name] = tester.results
            self.results['total_passed'] += tester.results['passed']
            self.results['total_failed'] += tester.results['failed']
            
            return tester.results
        except Exception as e:
            print(f"❌ Erro ao executar {module_name}: {e}")
            return {'passed': 0, 'failed': 6, 'errors': [str(e)]}
    
    def run_all_modules(self):
        """Executar testes de todos os módulos"""
        print("\n" + "="*70)
        print("🚀 INICIANDO FRAMEWORK DE TESTES DE INTEGRAÇÃO (PADRÃO B)")
        print("="*70)
        print(f"Base URL: {BASE_URL}")
        print("⚠️  Certifique-se que o backend está rodando!")
        print("="*70 + "\n")
        
        # Auth (sem admin_token)
        self._run_module(TestAuth, "AUTENTICAÇÃO", "🔐", use_admin_token=False)
        
        # Módulos originais (com admin_token)
        self._run_module(TestParceiro, "PARCEIRO", "🏢", use_admin_token=True)
        self._run_module(TestTema, "TEMA", "🎨", use_admin_token=True)
        self._run_module(TestPagina, "PÁGINA", "📄", use_admin_token=True)
        self._run_module(TestComponente, "COMPONENTE", "🧩", use_admin_token=True)
        self._run_module(TestElemento, "ELEMENTO", "⚙️", use_admin_token=True)
        self._run_module(TestPagComRel, "PÁG-COM-REL", "🔗", use_admin_token=True)
        self._run_module(TestComEleRel, "COM-ELE-REL", "🔗", use_admin_token=True)
        
        # Módulos temáticos (com admin_token)
        self._run_module(TestCores, "CORES", "🎨", use_admin_token=True)
        time.sleep(15)
        
        self._run_module(TestImagens, "IMAGENS", "🖼️", use_admin_token=True)
        time.sleep(15)
        
        self._run_module(TestLinks, "LINKS", "🔗", use_admin_token=True)
        time.sleep(90)  # Très long delay para evitar rate limit completamente
        
        self._run_module(TestTextos, "TEXTOS", "📝", use_admin_token=True)
        time.sleep(120)  # Espera 2 minutos completos
        
        self._run_module(TestConteudo, "CONTEÚDO", "📄", use_admin_token=True)
        time.sleep(120)  # Espera 2 minutos
        
        self._run_module(TestFeatures, "FEATURES", "⭐", use_admin_token=True)
        time.sleep(120)  # Espera 2 minutos
        
        self._run_module(TestConfigTema, "CONFIG-TEMA", "⚙️", use_admin_token=True)
        
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
        print(f"📚 Total de Testes:   {total_tests}")
        print("\n" + "="*70)
        
        if self.results['total_failed'] == 0:
            print("✨ TODOS OS TESTES PASSARAM COM SUCESSO!")
        else:
            print("\n⚠️  MÓDULOS COM FALHAS:\n")
            for modulo, resultado in self.results['modules'].items():
                if resultado['failed'] > 0:
                    print(f"  📌 {modulo}: {resultado['passed']}/{resultado['passed'] + resultado['failed']}")
        
        print("\n" + "="*70 + "\n")


def main():
    """Ponto de entrada"""
    orchestrator = TestOrchestratorUnified()
    orchestrator.run_all_modules()


if __name__ == "__main__":
    main()
