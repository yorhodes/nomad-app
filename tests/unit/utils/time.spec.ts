import { getMonth } from '@/utils/time'

describe('utils/index', () => {
  describe('getMonth', () => {
    it('should get month string given number index', () => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec',
      ]
      months.forEach((month, i) => {
        expect(getMonth(i)).toBe(month)
      })
    })

    it('should return empty string if provided an invalid index', () => {
      const invalidInputs = [-1, 12]
      invalidInputs.forEach((invalidInput) =>
        expect(getMonth(invalidInput)).toBe('')
      )
    })
  })
})
