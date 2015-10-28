import web
import os

urls = (
	'/describe', 'describe',
)

app = web.application(urls, globals())
render = web.template.render('templates/')


class describe:
	def GET(self):
		return render.describe()

if __name__ == "__main__":
	app.run()
