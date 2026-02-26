import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const PagComRel = sequelize.define('PagComRel', {
    pcr_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    pcr_pag_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: '0003_Página',
        key: 'pag_id',
      },
    },
    pcr_com_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: '0004_Componente',
        key: 'com_id',
      },
    },
    pcr_ordem: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pcr_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: '0006_Pág_Com_Rel',
    timestamps: true,
    underscored: false,
  });

  PagComRel.associate = (models) => {
    PagComRel.belongsTo(models.Pagina, {
      foreignKey: 'pcr_pag_id',
    });

    PagComRel.belongsTo(models.Componente, {
      foreignKey: 'pcr_com_id',
    });
  };

  return PagComRel;
}
