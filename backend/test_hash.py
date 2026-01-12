from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash = pwd_context.hash("test")
print(f"Hash success: {hash}")
print(f"Verify success: {pwd_context.verify('test', hash)}")
