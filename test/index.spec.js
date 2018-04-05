/*globals describe,it,before,beforeEach*/
const { expect } = require('chai');
const getTimezone = require('../src');

const { init } = getTimezone;

describe('Querying a timezone', () => {
	describe('without calling init() first', () => {
		it('should throw an error', () => {
			expect(() => {
				getTimezone(0, 0);
			}).to.throw;
		});
	});

	describe('after init() was called', () => {
		before(() => init());

		describe('with invalid arguments, that are', () => {
			describe('not numbers', () => {
				it('should not throw', () => {
					expect(() => {
						getTimezone('a', 'b');
					}).to.not.throw;
				});

				it('should return null', () => {
					expect(getTimezone('a', 'b')).to.be.null;
				});
			});

			describe('out of range (positive)', () => {
				it('should not throw', () => {
					expect(() => {
						getTimezone(91, 181);
					}).to.not.throw;
				});

				it('should return null', () => {
					expect(getTimezone(91, 181)).to.be.null;
				});
			});

			describe('out of range (negative)', () => {
				it('should not throw', () => {
					expect(() => {
						getTimezone(-91, -181);
					}).to.not.throw;
				});

				it('should return null', () => {
					expect(getTimezone(-91, -181)).to.be.null;
				});
			});
		});

		describe('with valid arguments, that refer to a', () => {
			describe('territorial area', () => {
				it('should not throw', () => {
					expect(() => {
						getTimezone(50.159489, 14.336539);
					}).to.not.throw;
				});

				it('should return the correct timezone', () => {
					const result = getTimezone(50.159489, 14.336539);
					expect(result).to.be.an('object');
					expect(result.id).to.equal('Europe/Prague');
					expect(result.type).to.equal('t');
					if (result.offset === 120) {
						expect(result.name).to.equal('CEST');
						expect(result.designator).to.equal('+02:00');
					} else if (result.offset === 60) {
						expect(result.name).to.equal('CET');
						expect(result.designator).to.equal('+01:00');
					} else {
						expect(result.offset).to.be.oneOf([60, 120]);
					}
				});
			});

			describe('nautical area', () => {
				it('should not throw', () => {
					expect(() => {
						getTimezone(43.952485, -36.393738);
					}).to.not.throw;
				});

				it('should return the correct timezone', () => {
					const result = getTimezone(43.952485, -36.393738);
					expect(result).to.be.an('object');
					expect(result.id).to.equal('O');
					expect(result.type).to.equal('n');
					expect(result.name).to.equal('Oscar');
					expect(result.designator).to.equal('-02:00');
					expect(result.offset).to.be.equal(-120);
				});
			});
		});
	});
});
