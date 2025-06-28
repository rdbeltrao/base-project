import { QueryInterface, DataTypes } from 'sequelize'

// Valores do enum definidos diretamente para evitar dependência circular

export default {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('reservations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reservation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('confirmed', 'canceled'),
        allowNull: false,
        defaultValue: 'confirmed',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    })

    await queryInterface.addIndex('reservations', {
      name: 'reservations_event_id_user_id_unique',
      unique: true,
      fields: ['event_id', 'user_id'],
    })

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION trg_adjust_reserved_spots()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          IF NEW.status = 'confirmed' THEN
            UPDATE events
            SET reserved_spots = reserved_spots + 1
            WHERE id = NEW.event_id;
          END IF;
          RETURN NEW;
        END IF;
  
        IF TG_OP = 'UPDATE' THEN
          IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
            UPDATE events
            SET reserved_spots = reserved_spots + 1
            WHERE id = NEW.event_id;
          ELSIF OLD.status = 'confirmed' AND NEW.status <> 'canceled' THEN
            UPDATE events
            SET reserved_spots = reserved_spots - 1
            WHERE id = NEW.event_id;
          END IF;
          RETURN NEW;
        END IF;
  
        IF TG_OP = 'DELETE' THEN
          IF OLD.status = 'confirmed' THEN
            UPDATE events
            SET reserved_spots = reserved_spots - 1
            WHERE id = OLD.event_id;
          END IF;
          RETURN OLD;
        END IF;
  
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_reserved_spots ON reservations;
      CREATE TRIGGER trg_reserved_spots
      AFTER INSERT OR UPDATE OR DELETE ON reservations
      FOR EACH ROW EXECUTE FUNCTION trg_adjust_reserved_spots();
    `)
  },

  down: async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.removeIndex('reservations', 'reservations_event_id_user_id_unique')
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_reserved_spots ON reservations;
      DROP FUNCTION IF EXISTS trg_adjust_reserved_spots();
    `)
    await queryInterface.dropTable('reservations')
  },
}
