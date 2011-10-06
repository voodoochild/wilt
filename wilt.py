from flask import Flask, request, render_template, redirect, url_for
app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
@app.route('/<name>')
def wilt(name=None):
    if request.method == 'POST':
        if request.form['lastfmuser'] and not request.form['lastfmuser'] == '':
            return redirect('/' + request.form['lastfmuser'])
    
    return render_template('index.html', lastfmuser=name)

if __name__ == '__main__':
    app.run(debug=True)
