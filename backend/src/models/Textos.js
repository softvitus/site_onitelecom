import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Textos = sequelize.define('Textos', {
    txt_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    txt_tem_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: '0002_Tema',
        key: 'tem_id',
      },
    },
    txt_categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    txt_chave: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    txt_valor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: '0011_Textos',
    timestamps: true,
    underscored: false,
  });

  Textos.associate = (models) => {
    Textos.belongsTo(models.Tema, {
      foreignKey: 'txt_tem_id',
      as: 'tema',
    });
  };

  return Textos;
}
