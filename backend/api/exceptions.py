"""Domain exceptions raised by the service layer. Controllers catch these
and translate them into HTTP responses — services never know about HTTP."""


class UserNotFound(Exception):
    pass


class EmailAlreadyInUse(Exception):
    pass


class AccountNotFound(Exception):
    pass


class InvalidAmount(Exception):
    pass


class InsufficientFunds(Exception):
    pass
