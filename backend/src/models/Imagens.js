import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Imagens = sequelize.define('Imagens', {
    img_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    img_tem_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: '0002_Tema',
        key: 'tem_id',
      },
    },
    img_categoria: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    img_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    img_valor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: '0009_Imagens',
    timestamps: true,
    underscored: false,
  });

  Imagens.associate = (models) => {
    Imagens.belongsTo(models.Tema, {
      foreignKey: 'img_tem_id',
      as: 'tema',
    });
  };

  return Imagens;
}
