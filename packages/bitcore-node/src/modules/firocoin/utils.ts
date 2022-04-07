import { Decimal } from 'decimal.js';

export const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

export const convertToSmallUnit = ({ amount, decimals }) => {
  const decimalOfAmount = countDecimals(+amount);
  const smallUnit =
    BigInt(new Decimal(amount).mul(new Decimal(10).pow(new Decimal(decimalOfAmount))).toString()) *
    BigInt(new Decimal(10).pow(new Decimal(decimals - decimalOfAmount)).toString());
  return smallUnit.toString();
};
