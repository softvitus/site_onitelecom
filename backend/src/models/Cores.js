import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Cores = sequelize.define(
    'Cores',
    {
      cor_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cor_tem_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
      },
      cor_categoria: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      cor_nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cor_valor: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cor_componente: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nome do componente (ex: Header, Ofertas, Footer)',
      },
      cor_variavel_ref: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Referência original da variável (ex: var(--color-primary))',
      },
      cor_descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição da cor e seu uso',
      },
      cor_ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se a cor está ativa no sistema',
      },
    },
    {
      tableName: '0008_Cores',
      timestamps: true,
      underscored: false,
    },
  );

  Cores.associate = (models) => {
    Cores.belongsTo(models.Tema, {
      foreignKey: 'cor_tem_id',
      as: 'tema',
    });
  };

  return Cores;
}
