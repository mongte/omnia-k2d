# Pure Python tools for agents

def calculate_returns(initial: float, final: float) -> float:
    """Calculate percentage return."""
    if initial == 0:
        return 0.0
    return ((final - initial) / initial) * 100
