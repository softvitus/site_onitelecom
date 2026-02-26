import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Cores = sequelize.define('Cores', {
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
  }, {
    tableName: '0008_Cores',
    timestamps: true,
    underscored: false,
  });

  Cores.associate = (models) => {
    Cores.belongsTo(models.Tema, {
      foreignKey: 'cor_tem_id',
      as: 'tema',
    });
  };

  return Cores;
}
