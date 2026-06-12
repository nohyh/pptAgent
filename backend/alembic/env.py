import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# 将父目录添加到 sys.path 中，以便我们导入 app 模块
backend_dir = Path(__file__).resolve().parents[1]
sys.path.append(str(backend_dir))

# 加载环境变量
from dotenv import load_dotenv
load_dotenv(dotenv_path=backend_dir / ".env")

# 从 app.database 导入目标元数据
from app.database import Base
target_metadata = Base.metadata

# 这是 Alembic 配置对象，它提供对当前使用的 .ini 文件中值的访问。
config = context.config

# 解析配置文件以进行 Python 日志初始化。
# 这一行主要用于设置日志记录器。
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 从环境变量动态设置 sqlalchemy.url
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)


# 可以根据 env.py 的需要，获取配置中的其他值：
# my_important_option = config.get_main_option("my_important_option")
# ... 等等。


def run_migrations_offline() -> None:
    """在 '离线' 模式下运行迁移。

    这会配置上下文仅使用 URL，而不使用引擎，尽管引擎在这里也是可以接受的。
    通过跳过引擎创建，我们甚至不需要可用的 DBAPI。

    此处对 context.execute() 的调用会将给定的字符串发送到脚本输出。

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """在 '在线' 模式下运行迁移。

    在这种情况下，我们需要创建一个引擎并将连接与上下文相关联。

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
