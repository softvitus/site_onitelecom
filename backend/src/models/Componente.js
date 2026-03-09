import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Componente = sequelize.define(
    'Componente',
    {
      com_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      com_nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      com_descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      com_tipo: {
        type: DataTypes.ENUM('global', 'reutilizável', 'específico'),
        allowNull: true,
      },
      com_possui_elementos: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      com_habilitado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: '0004_Componente',
      timestamps: true,
      underscored: false,
    },
  );

  Componente.associate = (models) => {
    Componente.belongsToMany(models.Pagina, {
      through: models.PagComRel,
      foreignKey: 'pcr_com_id',
      otherKey: 'pcr_pag_id',
      as: 'paginas',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Componente.hasMany(models.PagComRel, {
      foreignKey: 'pcr_com_id',
      as: 'pag_com_rels',
    });

    Componente.belongsToMany(models.Elemento, {
      through: models.ComEleRel,
      foreignKey: 'cer_com_id',
      otherKey: 'cer_ele_id',
      as: 'elementos',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Componente.hasMany(models.ComEleRel, {
      foreignKey: 'cer_com_id',
      as: 'com_ele_rels',
    });
  };

  return Componente;
}
