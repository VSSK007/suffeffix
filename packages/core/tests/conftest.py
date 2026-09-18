import pytest

from suffeffix_core.index import GraphIndex
from suffeffix_core.load import load_dataset


@pytest.fixture(scope="session")
def dataset():
    return load_dataset()


@pytest.fixture(scope="session")
def index(dataset):
    return GraphIndex(dataset)
