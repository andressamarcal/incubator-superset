from zipfile import ZipFile
import logging

from superset.models.core import Database

def import_database(session, data_stream):
    """Imports a new database and its tables"""
    f = ZipFile(data_stream)
    logging.info(f.namelist())

    Database.import_from_dict()
