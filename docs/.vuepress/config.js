module.exports = {
  base: '/',
  title: 'NULS SDK',
  description: 'Interact with the NULS Blockchain in JavaScript',
  themeConfig: {
    repo: 'CCC-NULS/nulsjs',
		editLinks: true,
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
			{ text: 'v1.x', link: 'https://CCC-NULS.github.io/nuls-js' }
    ],
    sidebar: [
      ['/guide/', 'Getting Started'],
      ['/guide/core/', 'Core'],
			['/guide/account/', 'Account'],
			{
				title: 'Transaction',
				collapsable: true,
				children: [
          ['/guide/transaction/', 'Basic concepts'],
					'/guide/transaction/api',
					'/guide/transaction/transfer',
					'/guide/transaction/alias',
					'/guide/transaction/deposit',
					'/guide/transaction/cancelDeposit',
				]
			}
		]
  }
}