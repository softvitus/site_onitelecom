import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Pagina = sequelize.define(
    'Pagina',
    {
      pag_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      pag_par_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0001_Parceiro',
          key: 'par_id',
        },
      },
      pag_tem_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
      },
      pag_nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      pag_caminho: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pag_titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pag_mostrar_no_menu: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      pag_etiqueta_menu: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pag_ordem_menu: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pag_icone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pag_categoria: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pag_status: {
        type: DataTypes.ENUM('ativo', 'inativo', 'suspenso'),
        allowNull: false,
        defaultValue: 'ativo',
      },
    },
    {
      tableName: '0003_Página',
      timestamps: true,
      underscored: false,
    },
  );

  Pagina.associate = (models) => {
    Pagina.belongsTo(models.Parceiro, {
      foreignKey: 'pag_par_id',
      as: 'parceiro',
    });

    Pagina.belongsTo(models.Tema, {
      foreignKey: 'pag_tem_id',
      as: 'tema',
    });

    Pagina.belongsToMany(models.Componente, {
      through: models.PagComRel,
      foreignKey: 'pcr_pag_id',
      otherKey: 'pcr_com_id',
      as: 'componentes',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Pagina.hasMany(models.PagComRel, {
      foreignKey: 'pcr_pag_id',
      as: 'pag_com_rels',
    });
  };

  return Pagina;
}
