module.exports = VacanciesRepository

function VacanciesRepository () {
  if (!(this instanceof VacanciesRepository)) return new VacanciesRepository()

  const vacancies = {}

  this.save = async (vacancy) => {
    vacancies[vacancy.id] = vacancy
  }

  this.get = async (vacancyId) => {
    return vacancies[vacancyId]
  }
}

