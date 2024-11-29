//date를 2024.03.06. 18:00에서 2024.03.06 형식으로
export const parseDate = (date: string | undefined) => {
  if (!date) return;
  const dateSplit = date.split(' ');
  const dateOnly = dateSplit[0];
  const formattedDate =
    dateOnly.slice(2, 4) +
    '.' +
    dateOnly.slice(5, 7) +
    '.' +
    dateOnly.slice(8, 10);
  return formattedDate;
};
