export default function isPhone(val) {
  return /^1[3456789]\d{9}$/.test(val)
}
