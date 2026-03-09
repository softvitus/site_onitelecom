/**
 * @file Componente Footer - Rodapé da Aplicação
 * @description Rodapé simples com copyright dinâmico do ano atual
 *
 * @module componentes/Layout/Footer
 */

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Footer
 *
 * Rodapé da aplicação que exibe copyright com ano atual.
 *
 * @component
 * @returns {JSX.Element}
 *
 * @example
 * <Footer />
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p style={{ margin: 0 }}>© {year} Site Oni Admin. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
