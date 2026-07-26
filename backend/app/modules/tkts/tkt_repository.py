from app.db.db_connection import db_conn
from psycopg2.extras import RealDictCursor

def listing():
    con = db_conn()
    cur = con.cursor(cursor_factory=RealDictCursor)

    cur.execute("""SELECT 
                tl.*, 
                CASE 
                    WHEN COALESCE(SUM(CASE WHEN tct.is_completed THEN 1 ELSE 0 END), 0) = 0 THEN 'planned'
                    WHEN COALESCE(SUM(CASE WHEN tct.is_completed THEN 1 ELSE 0 END), 0) = COUNT(tct.id) THEN 'done'
                    ELSE 'ongoing' END
                AS status 
                FROM tkt_list AS tl
                LEFT JOIN tkt_completed_tasks AS tct ON tct.tkt_id = tl.id
                WHERE tl.is_delete = FALSE
                GROUP BY tl.id
                ORDER BY tl.release_date DESC;
                """)
    data = cur.fetchall()
    cur.close()
    con.close()

    return data

def tkt_create(name, release_date, notes=""):
    con = db_conn()
    cur = con.cursor()

    cur.execute("INSERT INTO tkt_list (name, release_date, notes, created_on) VALUES(%s, %s, %s, NOW()) RETURNING id",(name, release_date, notes))
    tkt_id = cur.fetchone()
    create_task_entry(cur, tkt_id[0])

    con.commit()
    cur.close()
    con.close()

    return tkt_id

def get_tkt_by_id(tkt_id):
    con = db_conn()
    cur = con.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            tl.id AS tkt_id,
            tl.name AS tkt_name,
            tl.release_date AS tkt_release_date,
            tl.notes,
            tt.id,
            tt.task_name,
            tct.is_completed
        FROM tkt_list tl
        JOIN tkt_completed_tasks tct
            ON tl.id = tct.tkt_id
        JOIN tkts_task tt
            ON tt.id = tct.task_id
        WHERE tl.id = %s
        ORDER BY tt.id;
    """, (tkt_id,))

    data = cur.fetchall()

    cur.close()
    con.close()

    return data

def update_task(tkt_id, name=None, release_date=None, tasks=None, notes=None):
    con = db_conn()
    cur = con.cursor()

    if name is not None and name.strip():
        cur.execute("""
            UPDATE tkt_list
            SET name = %s,
                updated_on = NOW()
            WHERE id = %s;
        """, (
            name,
            tkt_id
        ))

    if release_date is not None and str(release_date).strip():
        cur.execute("""
            UPDATE tkt_list
            SET release_date = %s,
                updated_on = NOW()
            WHERE id = %s;
        """, (
            release_date,
            tkt_id
        ))

    if notes is not None:
        cur.execute("""
            UPDATE tkt_list
            SET notes = %s,
                updated_on = NOW()
            WHERE id = %s;
        """, (
            notes,
            tkt_id
        ))

    # Update checklist
    if tasks:
        for task in tasks:
            cur.execute("""
                UPDATE tkt_completed_tasks
                SET
                    is_completed = %s,
                    updated_on = NOW()
                WHERE
                    tkt_id = %s
                    AND task_id = %s;
            """, (
                task.is_completed,
                tkt_id,
                task.task_id
            ))

    con.commit()
    cur.close()
    con.close()

    return True


def tkt_delete(tkt_id):
    con = db_conn()
    cur = con.cursor()

    cur.execute("""
        UPDATE tkt_list
        SET is_delete = TRUE,
            updated_on = NOW()
        WHERE id = %s
        RETURNING id;
    """, (tkt_id,))

    data = cur.fetchone()

    con.commit()
    cur.close()
    con.close()

    return data

def create_task_entry(cur, tkt_id):
    cur.execute("SELECT id FROM tkts_task")
    task_lists = cur.fetchall()

    for task in task_lists:
        cur.execute("""
            INSERT INTO tkt_completed_tasks (
                tkt_id,
                task_id
            ) VALUES (%s, %s);
        """,(tkt_id, task[0]))
