import multiprocessing
 
workers = multiprocessing.cpu_count() * 2 + 1
#worker_class = 'gevent'
secure_scheme_headers = {
    'X-FORWARDED-PROTO': 'https',
}