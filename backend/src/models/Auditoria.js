/**
 * Auditoria Model
 * Rastreamento de ações realizadas no sistema
 */

import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Auditoria = sequelize.define(
    'Auditoria',
    {
      aud_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      aud_usuario_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'ID do usuário que realizou a ação',
      },
      aud_acao: {
        type: DataTypes.ENUM(
          'criar',
          'editar',
          'deletar',
          'visualizar',
          'inativar',
          'ativar',
          'login',
          'logout',
        ),
        allowNull: false,
        comment: 'Tipo de ação realizada',
      },
      aud_entidade: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Tipo de entidade afetada (parceiro, tema, usuario, etc)',
      },
      aud_entidade_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID da entidade afetada',
      },
      aud_dados_anteriores: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Dados antes da modificação (apenas para editar/deletar)',
      },
      aud_dados_novos: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Dados após a modificação (apenas para criar/editar)',
      },
      aud_ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP do cliente que realizou a ação',
      },
      aud_user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'User Agent do navegador/cliente',
      },
      aud_status: {
        type: DataTypes.ENUM('sucesso', 'erro'),
        defaultValue: 'sucesso',
        allowNull: false,
        comment: 'Status da operação',
      },
      aud_mensagem_erro: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensagem de erro (se status = erro)',
      },
    },
    {
      tableName: '0063_Auditoria',
      timestamps: true,
      underscored: false,
    },
  );

  /**
   * Associações
   */
  Auditoria.associate = (models) => {
    // Auditoria pertence a um Usuário
    if (models.Usuario) {
      Auditoria.belongsTo(models.Usuario, {
        foreignKey: 'aud_usuario_id',
        targetKey: 'usu_id',
        as: 'usuario',
      });
    }
  };

  return Auditoria;
}
