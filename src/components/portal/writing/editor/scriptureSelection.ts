export const formatScriptureVerseSelection = (numbers: number[]) => {
  const selected = [...new Set(numbers)].sort((left, right) => left - right);

  if (selected.length === 0) return '';

  const groups = selected.reduce<number[][]>((current, number) => {
    const group = current.at(-1);

    if (group && number === group.at(-1)! + 1) {
      group.push(number);
    } else {
      current.push([number]);
    }

    return current;
  }, []);

  return groups
    .map((group) => group.length === 1 ? String(group[0]) : `${group[0]}-${group.at(-1)}`)
    .join(', ');
};
