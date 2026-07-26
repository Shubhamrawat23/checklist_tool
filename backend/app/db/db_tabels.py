from app.db.db_connection import db_conn

def create_tables_and_insert_data():
    con = db_conn()
    cur = con.cursor()

    if not con:
        print("Database connection failed")
        return
    
    #  Releasing tkts list table 
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tkt_list (
            id SERIAL PRIMARY KEY,
            name varchar(100) NOT NULL,
            release_date timestamp NOT NULL,
            notes text DEFAULT NULL,
            is_delete boolean DEFAULT FALSE,
            created_on timestamp DEFAULT NOW(),
            updated_on timestamp DEFAULT NULL
        );
    """)

    # main table for task list
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tkts_task (
            id SERIAL PRIMARY KEY,
            task_name varchar(100),
            created_on timestamp DEFAULT NOW()
        )
    """)

    #create task list entry
    cur.executemany("""
        INSERT INTO tkts_task (
            task_name
        )
        VALUES(%s);""",
        (
            ("All relevant Github pull requests have been merged",),
            ("CHANGELOG.md files have been updated",),
            ("All tests are passing",),
            ("Releases in Github created",),
            ("Deployed in demo",),
            ("Tested thoroughly in demo",),
            ("Deployed in poduction",)
        )
    )

    # map table for check the tasks
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tkt_completed_tasks (
            id SERIAL PRIMARY KEY,
            tkt_id int4,
            task_id int4,
            is_completed boolean DEFAULT FALSE,
            created_on timestamp DEFAULT NOW(),
            updated_on timestamp DEFAULT NULL,
            FOREIGN KEY (tkt_id) REFERENCES tkt_list(id),
            FOREIGN KEY (task_id) REFERENCES tkts_task(id)
        );
    """)

    con.commit()
    cur.close()
    con.close()

    print("ALL data and table successfully added")


if __name__ == "__main__":
    create_tables_and_insert_data()