/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

const ava = require('ava')
const formatters = require('./formatters')

ava('.formatCurrency() defaults to USD, no unnecessary decimal places', (test) => {
	test.is(formatters.formatCurrency('12'), '$12')
})

ava('.formatCurrency() can accept a different currency', (test) => {
	test.is(formatters.formatCurrency('12', 'GBP'), '£12')
})

ava('.formatCurrency() can force two decimal places', (test) => {
	test.is(formatters.formatCurrency('12', 'USD', 2), '$12.00')
})

ava('.formatCurrency() returns an empty string if no value provided', (test) => {
	test.is(formatters.formatCurrency(), '')
})

ava('.formatSize() should return null when a negative number is provided', (test) => {
	test.is(formatters.formatSize(-1), null)
})

ava('.formatSize() should correctly format 0 bytes', (test) => {
	test.is(formatters.formatSize(0), '0 bytes')
})

ava('.formatSize() should correctly format bytes', (test) => {
	test.is(formatters.formatSize(102), '102 bytes')
})

ava('.formatSize() should correctly format KB', (test) => {
	test.is(formatters.formatSize(1536), '2 KB')
})

ava('.formatSize() should correctly format MB', (test) => {
	test.is(formatters.formatSize(3000000), '3 MB')
})

ava('.formatSize() should correctly format GB', (test) => {
	test.is(formatters.formatSize(1800000000), '1.8 GB')
})

ava('.formatSize() should correctly format TB', (test) => {
	test.is(formatters.formatSize(1800000000000), '1.8 TB')
})

ava('.formatSize() should correctly format PB', (test) => {
	test.is(formatters.formatSize(3500000000000000), '3.5 PB')
})

ava('.formatMb() should return \'-\' when null is provided', (test) => {
	test.is(formatters.formatMb(null), '-')
})

ava('.formatMb() should correctly format MB', (test) => {
	test.is(formatters.formatMb(3.1), '3 MB')
})
