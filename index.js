/**
 * @typedef Client
 * @type {object}
 * @property {string} name
 * @property {number} balance
 */

/**
 * @typedef Bank
 * @type {object}
 * @property {string} bankName
 * @property {Array<Client>} clients
 * @property {(client: Client) => boolean | Error} addClient
 * @property {(client: Client) => boolean | Error} removeClient
 */

/**
 * @typedef Bankomat
 * @type {object}
 * @property {Bank} bank
 * @property {{[key: string]: number}} notesRepository
 * @property {Client | undefined} currentClient
 * @property {(client: Client) => boolean} setClient
 * @property {(client: Client) => boolean} removeClient
 * @property {(notesRepository: {[key: string]: number}) => void} addMoney
 * @property {(sumToGive: number) => boolean | Error} giveMoney
 */

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */

function createClient(name, balance = 0) {
    if (typeof name !== "string" || typeof balance !== "number") {
        throw new Error();
    }

    return {
        name,
        balance,
    };
}


/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */


function createBank(bankName, clients = []) {
    if (typeof bankName !== "string" || !Array.isArray(clients) || !bankName) {
        throw new Error();
    }

    const bank = {
        bankName,
        clients,

        addClient(client) {
            if (checkClient(client) || findClientIndex(this.clients, client) !== -1)
                throw new Error();

            this.clients.push(client);
            return true;
        },

        removeClient(client) {
            const clientIndex = findClientIndex(this.clients, client);

            if (clientIndex !== -1) {
                this.clients = this.clients.filter((e, index) => index !== clientIndex);
                return true;
            }

            throw new Error();
        },
    }
    return bank;
}

function findClientIndex(clients, client) {
    return clients.findIndex(e => e.name == client.name && e.balance == client.balance && typeof client === "object" &&
        client.balance && typeof client.name === "string" && client.balance && typeof client.balance === "number");
}

function checkClient(client) {
    return typeof client !== "object" ||
        (!client.balance || typeof client.balance !== "number" ||
            !client.name || typeof client.name !== "string")
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */


function createBankomat(bankNotesRepository, bank) {

    if (!CheckBank(bank) || typeof bankNotesRepository !== "object")
        throw new Error();

    const bankomat = {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient(client) {

            if (bankomat.currentClient == undefined && findClientIndex(this.bank.clients, client) !== -1) {
                bankomat.currentClient = client;
                return true;
            }

            throw new Error();
        },

        removeClient() {
            if (bankomat.currentClient !== undefined) {
                bankomat.currentClient = undefined;
                return true;
            }

            throw new Error();
        },

        addMoney(...cashes) {
            if (!this.currentClient || !cashes.length)
                throw new Error();

            for (const cash of cashes) {
                for (const e in cash) {
                    this.notesRepository[e] += cash[e];
                    this.currentClient.balance += cash[e] * e;
                }
            }
            return this.addMoney.bind(this);
        },

        giveMoney(count) {

            if (typeof count !== 'number' || !this.currentClient ||
                count > this.currentClient.balance || count % 10 !== 0) {
                throw new Error();
            }

            const result = {};
            const cash = count;
            const arrNotes = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);

            arrNotes.forEach(([banknote, banknoteCount], i) => {

                let integer = Math.floor(count / banknote);

                if (banknoteCount !== 0 && count >= banknote) {

                    if (banknoteCount * banknote <= count) {
                        integer = banknoteCount;
                    }

                    result[banknote] = integer;
                    arrNotes[i] = [banknote, banknoteCount - integer];
                    this.notesRepository[banknote] -= integer;

                    count -= banknote * integer;
                }
            });

            if (count != 0) {
                throw new Error();
            }

            this.currentClient.balance -= cash;
            return result;
        }
    }
    return bankomat;
}

function CheckBank(bank) {
    return typeof bank === "object" && typeof bank.bankName === "string" &&
        Array.isArray(bank.clients) && typeof bank.addClient === "function" &&
        typeof bank.removeClient === "function"
}

module.exports = { createClient, createBank, createBankomat };