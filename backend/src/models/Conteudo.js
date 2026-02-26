import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Conteudo = sequelize.define('Conteudo', {
    cnt_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    cnt_tem_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: '0002_Tema',
        key: 'tem_id',
      },
    },
    cnt_tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    cnt_categoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cnt_titulo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cnt_descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cnt_dados: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cnt_ordem: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cnt_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: '0012_Conteudo',
    timestamps: true,
    underscored: false,
  });

  Conteudo.associate = (models) => {
    Conteudo.belongsTo(models.Tema, {
      foreignKey: 'cnt_tem_id',
      as: 'tema',
    });
  };

  return Conteudo;
}
