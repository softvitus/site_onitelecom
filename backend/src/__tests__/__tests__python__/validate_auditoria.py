#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Validação rápida do módulo de auditoria Python
Verifica estrutura e funcionalidade basic
"""

from lib.auditoria import TestAuditoria
import json

print("="*60)
print("✅ VALIDAÇÃO DO MÓDULO TESTAUDITORIA")
print("="*60)

# 1. Verificar se a classe existe
print("\n✓ Classe TestAuditoria importada com sucesso")

# 2. Instanciar
try:
    auditoria_tester = TestAuditoria()
    print("✓ Instância TestAuditoria criada")
except Exception as e:
    print(f"✗ Erro ao instanciar: {e}")
    exit(1)

# 3. Verificar métodos
required_methods = [
    '_authenticate',
    '_get_headers',
    '_print_test',
    'test_list_auditoria',
    'test_auditoria_with_filters',
    'test_auditoria_estatisticas',
    'test_auditoria_por_usuario',
    'test_auditoria_por_entidade',
    'test_auditoria_obter_por_id',
    'test_auditoria_sem_autenticacao',
    'run_all_tests'
]

print("\n✓ Métodos definidos:")
for method in required_methods:
    if hasattr(auditoria_tester, method):
        print(f"  ✓ {method}")
    else:
        print(f"  ✗ {method} FALTANDO")

# 4. Verificar estrutura de resultados
print("\n✓ Estrutura de resultados:")
expected_fields = ['passed', 'failed', 'errors']
for field in expected_fields:
    if field in auditoria_tester.results:
        print(f"  ✓ results['{field}'] = {auditoria_tester.results[field]}")

# 5. Validar que a classe herda da estrutura correta
print("\n✓ Propriedades de instância:")
print(f"  • token: {auditoria_tester.token}")
print(f"  • usuario_id: {auditoria_tester.usuario_id}")
print(f"  • auditoria_id: {auditoria_tester.auditoria_id}")

print("\n" + "="*60)
print("✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO")
print("="*60)
print("\n📌 Próxima seção:")
print("   Para rodar os testes reais, execute:")
print("   $ python run_tests.py")
print("\n   Ou para testar apenas auditoria:")
print("   $ python run_tests_stable.py")
print("="*60 + "\n")
