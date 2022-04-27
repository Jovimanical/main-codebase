import pytest
def function(one,two):
    return one + two 

def test_one_plus_one():
    result = function(1,3)
    assert result == 4